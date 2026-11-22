/*
  API simulée : elle joue le rôle du logiciel comptable du cabinet (spec, section 9).
  Chaque fonction correspond à un endpoint REST qu'une vraie API exposerait :

    GET  /api/clients?statut=…      → getClients(statut)
    GET  /api/clients/:id           → getClient(id)
    GET  /api/clients?slug=…        → getClientBySlug(slug)
    GET  /api/kpis                  → getKpis()
    POST /api/clients/:id/relances  → postRelance(id)

  Les données vivent en mémoire pendant la session : un rechargement de page repart du JSON.
*/
import rawData from '../data/clients.json'
import { compteConnecte } from './auth-api'
import { composeRelance, type MailRelance } from '../domain/mail'
import { slugify } from '../domain/slug'
import { computeStatus, derniereRelance, piecesManquantes } from '../domain/status'
import type { Client, ClientView, Collaborateur, DossierStatus, Kpis, Relance } from '../domain/types'

/*
  Le JSON ne stocke pas le texte des relances passées (il serait trop long à écrire à la main) :
  il est reconstitué au chargement avec le modèle de mail actuel (voir withMails).
*/
type RawClient = Omit<Client, 'relances'> & { relances: Omit<Relance, 'objet' | 'message'>[] }

type Dataset = {
  dateReference: string // date à laquelle le jeu de données a été écrit
  collaborateurs: Collaborateur[]
  clients: RawClient[]
}

type Database = Omit<Dataset, 'clients'> & { clients: Client[] }

// Les 24 clients représentent un cabinet de 180 dossiers : les KPI sont multipliés par ce facteur
export const TOTAL_DOSSIERS_CABINET = 180
const FACTEUR_CABINET = TOTAL_DOSSIERS_CABINET / 24

// Hypothèse de temps gagné par relance faite en un clic au lieu d'un mail rédigé à la main
export const MINUTES_GAGNEES_PAR_RELANCE = 10

// Utilisateur de démo : signe les relances quand le compte connecté n'a pas encore de nom
export const UTILISATEUR_CONNECTE = 'Claire Lemoine'
// Cabinet fictif : affiché dans la barre latérale et en signature des mails de relance
export const NOM_CABINET = 'Cabinet Lemoine'

const JOUR_MS = 24 * 60 * 60 * 1000

export class ApiError extends Error {}
// Adresse de fiche qui ne correspond à aucun client : la page affiche « introuvable » au lieu d'une erreur réseau
export class ClientIntrouvable extends ApiError {}

type ApiOptions = {
  data?: Dataset
  now?: () => Date
  // Latence simulée en ms [min, max]
  latency?: [number, number]
  // Probabilité d'échec de chaque appel, de 0 (jamais) à 1 (toujours)
  failRate?: () => number
}

// Reconstitue l'objet et le message de chaque relance passée : les pièces relancées ce jour-là, signées par le collaborateur
function withMails(data: Dataset): Database {
  return {
    ...data,
    clients: data.clients.map((client) => {
      const signature = {
        collaborateur: data.collaborateurs.find((c) => c.id === client.collaborateurId)?.nom ?? NOM_CABINET,
        cabinet: NOM_CABINET,
      }
      return {
        ...client,
        relances: client.relances.map((relance) => {
          const pieces = client.pieces.filter((p) => relance.pieces.includes(p.id))
          const { objet, message } = composeRelance({ ...client, relances: [] }, new Date(relance.date), signature, pieces)
          return { ...relance, objet, message }
        }),
      }
    }),
  }
}

// Décale toutes les dates du jeu de données pour que la démo reste crédible quel que soit le jour d'ouverture
function shiftDataset(data: Dataset, now: Date): Dataset {
  const reference = new Date(`${data.dateReference}T00:00:00`)
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const offsetMs = Math.round((today.getTime() - reference.getTime()) / JOUR_MS) * JOUR_MS
  if (offsetMs === 0) return structuredClone(data)

  const shiftDay = (iso: string) => new Date(new Date(`${iso}T00:00:00Z`).getTime() + offsetMs).toISOString().slice(0, 10)
  const shiftDateTime = (iso: string) => new Date(new Date(iso).getTime() + offsetMs).toISOString()

  return {
    ...structuredClone(data),
    clients: data.clients.map((client) => ({
      ...structuredClone(client),
      echeance: shiftDay(client.echeance),
      pieces: client.pieces.map((p) => ({ ...p, recueLe: p.recueLe && shiftDay(p.recueLe) })),
      relances: client.relances.map((r) => ({ ...r, date: shiftDateTime(r.date) })),
    })),
  }
}

// Lit le paramètre ?fail= de l'URL : ?fail=1 fait tout échouer, ?fail=0.3 fait échouer 30 % des appels
function failRateFromUrl(): number {
  if (typeof window === 'undefined') return 0
  const value = new URLSearchParams(window.location.search).get('fail')
  if (value === null) return 0
  const rate = Number(value)
  return Number.isFinite(rate) ? Math.min(Math.max(rate, 0), 1) : 0
}

export function createApi({
  data = rawData as Dataset,
  now = () => new Date(),
  latency = [400, 800],
  failRate = failRateFromUrl,
}: ApiOptions = {}) {
  const db = withMails(shiftDataset(data, now()))
  let compteurRelance = 0

  // Simule un aller-retour réseau : attente, puis échec éventuel
  async function network<T>(compute: () => T): Promise<T> {
    const [min, max] = latency
    const delay = min + Math.random() * (max - min)
    if (delay > 0) await new Promise((resolve) => setTimeout(resolve, delay))
    if (Math.random() < failRate()) throw new ApiError('Impossible de récupérer les dossiers')
    // Copie profonde : l'interface ne peut pas modifier la « base » par erreur
    return structuredClone(compute())
  }

  function toView(client: Client): ClientView {
    const collaborateur = db.collaborateurs.find((c) => c.id === client.collaborateurId)
    return {
      ...client,
      slug: slugify(client.nom),
      statut: computeStatus(client, now()),
      collaborateur: collaborateur?.nom ?? 'Non assigné',
      nbManquantes: piecesManquantes(client).length,
      derniereRelance: derniereRelance(client)?.date,
    }
  }

  function findClient(id: string): Client {
    const client = db.clients.find((c) => c.id === id)
    if (!client) throw new ApiError('Client introuvable')
    return client
  }

  // Tri par défaut : échéance la plus proche, puis le plus de pièces manquantes
  function byEcheanceThenManquantes(a: ClientView, b: ClientView) {
    return a.echeance.localeCompare(b.echeance) || b.nbManquantes - a.nbManquantes
  }

  return {
    // GET /api/clients?statut=…
    getClients(statut?: DossierStatus) {
      return network(() =>
        db.clients
          .map(toView)
          .filter((client) => !statut || client.statut === statut)
          .sort(byEcheanceThenManquantes),
      )
    },

    // GET /api/clients/:id
    getClient(id: string) {
      return network(() => toView(findClient(id)))
    },

    // GET /api/clients?slug=… : fiche ouverte depuis son adresse (/clients/garage-peyrot)
    getClientBySlug(slug: string) {
      return network(() => {
        const client = db.clients.find((c) => slugify(c.nom) === slug)
        if (!client) throw new ClientIntrouvable()
        return toView(client)
      })
    },

    // GET /api/kpis
    getKpis() {
      return network((): Kpis => {
        const views = db.clients.map(toView)
        const ilYaUneSemaine = now().getTime() - 7 * JOUR_MS
        const relancesSemaine = db.clients
          .flatMap((c) => c.relances)
          .filter((r) => new Date(r.date).getTime() >= ilYaUneSemaine).length

        const relancesCabinet = Math.round(relancesSemaine * FACTEUR_CABINET)
        return {
          dossiersComplets: Math.round(views.filter((c) => c.statut === 'complet').length * FACTEUR_CABINET),
          totalDossiers: TOTAL_DOSSIERS_CABINET,
          enRetard: Math.round(views.filter((c) => c.statut === 'en_retard').length * FACTEUR_CABINET),
          relancesSemaine: relancesCabinet,
          tempsGagneMinutes: relancesCabinet * MINUTES_GAGNEES_PAR_RELANCE,
        }
      })
    },

    /*
      POST /api/clients/:id/relances : relance les pièces manquantes (aucun mail réel n'est envoyé).
      « mail » : objet et message tels qu'envoyés depuis l'aperçu (retouches comprises).
      Sans lui, le mail par défaut est enregistré.
    */
    postRelance(id: string, mail?: Pick<MailRelance, 'objet' | 'message'>) {
      return network(() => {
        const client = findClient(id)
        const manquantes = piecesManquantes(client)
        if (manquantes.length === 0) throw new ApiError('Aucune pièce à relancer')

        const { objet, message } =
          mail ?? composeRelance(client, now(), { collaborateur: toView(client).collaborateur, cabinet: NOM_CABINET })
        compteurRelance += 1
        client.relances.push({
          id: `${client.id}-r-new${compteurRelance}`,
          date: now().toISOString(),
          // Relance signée par le compte connecté (nom saisi à l'inscription), sinon par l'utilisateur de démo
          par: compteConnecte()?.nom || UTILISATEUR_CONNECTE,
          pieces: manquantes.map((p) => p.id),
          canal: 'mail',
          mode: 'manuelle',
          objet,
          message,
        })
        return toView(client)
      })
    },
  }
}

export type ClientsApi = ReturnType<typeof createApi>

// Instance utilisée par l'application
export const api = createApi()
