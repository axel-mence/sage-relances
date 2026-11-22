/*
  Authentification simulée (refs-auth : pas de vrai backend, pas de vrai OAuth Sage).
  Délai réaliste de 0,8 à 1,5 s pour montrer l'état de chargement.
  Règle de démo : un mot de passe de moins de 8 caractères est refusé (pour voir l'état d'erreur).
*/
export type MethodeConnexion = 'sage' | 'google' | 'email'

export class IdentifiantsIncorrects extends Error {
  constructor() {
    super('Email ou mot de passe incorrect.')
  }
}

const MOT_DE_PASSE_MIN = 8

function attendre() {
  return new Promise((resolve) => setTimeout(resolve, 800 + Math.random() * 700))
}

export async function seConnecter(methode: MethodeConnexion, motDePasse = ''): Promise<void> {
  await attendre()
  if (methode === 'email' && motDePasse.length < MOT_DE_PASSE_MIN) throw new IdentifiantsIncorrects()
  memoriserMethode(methode)
}

// Dernière méthode utilisée, gardée dans le navigateur (badge « Dernière méthode utilisée »)
const CLE_METHODE = 'nudge:derniere-connexion'

export function derniereMethode(): MethodeConnexion | null {
  try {
    return localStorage.getItem(CLE_METHODE) as MethodeConnexion | null
  } catch {
    return null
  }
}

function memoriserMethode(methode: MethodeConnexion) {
  try {
    localStorage.setItem(CLE_METHODE, methode)
  } catch {
    // Stockage bloqué : le badge ne s'affichera simplement pas
  }
}

/*
  Inscription simulée : création du compte, code à 6 chiffres reçu par email, puis infos du cabinet.
  Règle de démo : le code « 000000 » est considéré comme expiré (pour voir l'état d'erreur).
*/
export class CodeExpire extends Error {
  constructor() {
    super('Ce code a expiré. Demandez-en un nouveau.')
  }
}

export async function creerCompte(methode: MethodeConnexion): Promise<void> {
  await attendre()
  memoriserMethode(methode)
}

export async function verifierCode(code: string): Promise<void> {
  await attendre()
  if (code === '000000') throw new CodeExpire()
}

export async function renvoyerCode(): Promise<void> {
  await attendre()
}

export type Cabinet = {
  nom: string
  dossiers: string
  role: 'associe' | 'collaborateur'
}

export async function enregistrerCabinet(cabinet: Cabinet): Promise<Cabinet> {
  await attendre()
  return cabinet
}

// Autorisation Sage simulée (le vrai parcours passerait par l'OAuth de Sage)
export async function autoriserSage(): Promise<void> {
  await attendre()
}

// Invitation des collaborateurs simulée (fin de l'onboarding)
export async function inviterCollaborateurs(emails: string[]): Promise<number> {
  await attendre()
  return emails.length
}
