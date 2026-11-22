/*
  Comptes et authentification, sans serveur (on reste au plus simple pour la démo).
  - Les comptes sont enregistrés dans le navigateur (localStorage) : un compte n'existe
    que dans le navigateur où il a été créé.
  - Le mot de passe n'est jamais gardé en clair : seule son empreinte SHA-256 est stockée
    (calcul à sens unique, on ne peut pas retrouver le mot de passe à partir de l'empreinte).
  - La session (compte connecté) survit au rechargement de la page.
  - Sage et Google restent fictifs : ils ouvrent un compte de démo.
  Délai réaliste de 0,8 à 1,5 s sur chaque appel pour montrer les états de chargement.
*/
export type MethodeConnexion = 'sage' | 'google' | 'email'

export type Role = 'associe' | 'collaborateur'

export type BoiteMail = 'outlook' | 'gmail'

export type Compte = {
  email: string
  empreinte: string // empreinte du mot de passe ('' pour le compte de démo Sage / Google)
  nom?: string
  cabinet?: string
  dossiers?: string
  role?: Role
  // Connecteurs, fictifs pour l'instant (écran Paramètres)
  sage: boolean
  boiteMail: BoiteMail | null
  // Modale d'invitation déjà vue : elle n'est proposée qu'une fois par compte
  invitationFaite?: boolean
}

export class IdentifiantsIncorrects extends Error {
  constructor() {
    super('Email ou mot de passe incorrect.')
  }
}

export class CompteExistant extends Error {
  constructor() {
    super('Un compte existe déjà avec cet email. Connectez-vous.')
  }
}

export class CodeExpire extends Error {
  constructor() {
    super('Ce code a expiré. Demandez-en un nouveau.')
  }
}

const CLE_COMPTES = 'nudge:comptes'
const CLE_SESSION = 'nudge:session'
const CLE_METHODE = 'nudge:derniere-connexion'

// Compte ouvert par les boutons fictifs « Sage » et « Google »
const EMAIL_DEMO = 'demo@cabinet-lemoine.fr'

function attendre() {
  return new Promise((resolve) => setTimeout(resolve, 800 + Math.random() * 700))
}

// Lecture et écriture protégées : en navigation privée stricte, le stockage peut être bloqué
function lire(cle: string): string | null {
  try {
    return localStorage.getItem(cle)
  } catch {
    return null
  }
}

function ecrire(cle: string, valeur: string | null) {
  try {
    if (valeur === null) localStorage.removeItem(cle)
    else localStorage.setItem(cle, valeur)
  } catch {
    // Stockage bloqué : la session ne durera que le temps de la page
  }
}

function lireComptes(): Record<string, Compte> {
  try {
    return JSON.parse(lire(CLE_COMPTES) ?? '{}') as Record<string, Compte>
  } catch {
    return {}
  }
}

function enregistrer(compte: Compte) {
  ecrire(CLE_COMPTES, JSON.stringify({ ...lireComptes(), [compte.email]: compte }))
  notifier()
}

// Email normalisé : « Paul@Cabinet.fr » et « paul@cabinet.fr » sont le même compte
function normaliser(email: string) {
  return email.trim().toLowerCase()
}

// Empreinte SHA-256 du mot de passe, salée avec l'email (2 comptes au même mot de passe n'ont pas la même)
async function empreinte(email: string, motDePasse: string) {
  const octets = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(`${email}:${motDePasse}`))
  return Array.from(new Uint8Array(octets), (octet) => octet.toString(16).padStart(2, '0')).join('')
}

/* ---------- Session : qui est connecté, avec abonnement pour que l'interface se mette à jour ---------- */

const abonnes = new Set<() => void>()

function notifier() {
  abonnes.forEach((abonne) => abonne())
}

export function abonnerSession(abonne: () => void) {
  abonnes.add(abonne)
  return () => {
    abonnes.delete(abonne)
  }
}

/*
  Instantané de la session pour useSyncExternalStore : le texte JSON du compte connecté.
  Un texte (et pas un objet) pour qu'il reste identique tant que rien ne change.
*/
export function instantaneSession(): string | null {
  const email = lire(CLE_SESSION)
  if (!email) return null
  const compte = lireComptes()[email]
  return compte ? JSON.stringify(compte) : null
}

export function compteConnecte(): Compte | null {
  const instantane = instantaneSession()
  return instantane ? (JSON.parse(instantane) as Compte) : null
}

/*
  Pas de notifier() ici : c'est la navigation qui suit (vers le SaaS ou l'étape suivante) qui
  rafraîchit l'interface. Sinon, la page de connexion verrait la session ouverte avant de partir
  et redirigerait elle-même vers le tableau de bord, en sautant l'écran de chargement ou l'étape suivante.
*/
function ouvrirSession(compte: Compte, methode: MethodeConnexion) {
  ecrire(CLE_SESSION, compte.email)
  ecrire(CLE_METHODE, methode)
}

export function seDeconnecter() {
  ecrire(CLE_SESSION, null)
  notifier()
}

// Met à jour le compte connecté (infos du cabinet, connecteurs…)
function modifierCompte(changements: Partial<Compte>) {
  const compte = compteConnecte()
  if (compte) enregistrer({ ...compte, ...changements })
}

/* ---------- Connexion et inscription ---------- */

// Dernière méthode utilisée (badge « Dernière méthode utilisée » sur la connexion)
export function derniereMethode(): MethodeConnexion | null {
  return lire(CLE_METHODE) as MethodeConnexion | null
}

// Sage et Google (fictifs) : ouvrent le compte de démo, créé à la première utilisation
async function connexionDemo(methode: MethodeConnexion) {
  await attendre()
  const compte = lireComptes()[EMAIL_DEMO] ?? { email: EMAIL_DEMO, empreinte: '', sage: false, boiteMail: null }
  enregistrer(compte)
  ouvrirSession(compte, methode)
  return compte
}

export async function seConnecter(methode: MethodeConnexion, email = '', motDePasse = ''): Promise<Compte> {
  if (methode !== 'email') return connexionDemo(methode)
  await attendre()
  const adresse = normaliser(email)
  const compte = lireComptes()[adresse]
  // Même message que le compte existe ou non : on ne révèle pas quels emails sont inscrits
  if (!compte || !compte.empreinte || compte.empreinte !== (await empreinte(adresse, motDePasse))) {
    throw new IdentifiantsIncorrects()
  }
  ouvrirSession(compte, 'email')
  return compte
}

export async function creerCompte(methode: MethodeConnexion, email = '', motDePasse = ''): Promise<Compte> {
  if (methode !== 'email') return connexionDemo(methode)
  await attendre()
  const adresse = normaliser(email)
  if (lireComptes()[adresse]) throw new CompteExistant()
  const compte: Compte = { email: adresse, empreinte: await empreinte(adresse, motDePasse), sage: false, boiteMail: null }
  enregistrer(compte)
  ouvrirSession(compte, 'email')
  return compte
}

// Code à 6 chiffres (simulé : aucun mail ne part). Règle de démo : « 000000 » est expiré.
export async function verifierCode(code: string): Promise<void> {
  await attendre()
  if (code === '000000') throw new CodeExpire()
}

export async function renvoyerCode(): Promise<void> {
  await attendre()
}

export type Cabinet = {
  nom: string
  cabinet: string
  dossiers: string
  role: Role
}

export async function enregistrerCabinet(infos: Cabinet): Promise<void> {
  await attendre()
  modifierCompte(infos)
}

/* ---------- Connecteurs (fictifs) ---------- */

// Autorisation Sage simulée (le vrai parcours passerait par l'OAuth de Sage)
export async function autoriserSage(): Promise<void> {
  await attendre()
}

// Fin de l'import (ou déconnexion depuis Paramètres) : le compte garde l'état « Sage connecté »
export function marquerSageConnecte(connecte: boolean) {
  modifierCompte({ sage: connecte })
}

export async function connecterBoiteMail(boite: BoiteMail | null): Promise<void> {
  await attendre()
  modifierCompte({ boiteMail: boite })
}

export function marquerInvitationFaite() {
  modifierCompte({ invitationFaite: true })
}

// Invitation des collaborateurs simulée (fin de l'onboarding)
export async function inviterCollaborateurs(emails: string[]): Promise<number> {
  await attendre()
  return emails.length
}
