import { formatJourMois } from './format'
import { toDateKey } from './status'
import type { Client, PieceAttendue, Relance } from './types'

/*
  Activité d'un client : tout ce qui s'est passé sur son dossier de la période.
  Elle est calculée à partir du client, jamais stockée (comme le statut) :
  elle ne peut donc pas contredire les pièces ou les relances affichées à côté.
*/
export type Evenement =
  | { type: 'ouverture'; date: string; nbPieces: number }
  | { type: 'piece_recue'; date: string; piece: PieceAttendue }
  | { type: 'relance'; date: string; relance: Relance }

export type JourActivite = {
  cle: string // AAAA-MM-JJ
  libelle: string // « Aujourd'hui », « Hier », « 18 novembre »
  evenements: Evenement[]
}

// Une date sans heure (« 2026-11-17 ») est lue en heure locale, pour ne pas glisser sur la veille
export function toDate(iso: string): Date {
  return new Date(iso.length === 10 ? `${iso}T00:00:00` : iso)
}

// Vrai si l'événement a une heure précise (une relance), faux pour un jour seul (pièce reçue, ouverture)
export function aUneHeure(evenement: Evenement): boolean {
  return evenement.date.length > 10
}

// Le dossier de la période s'ouvre le 1er du mois de l'échéance (octobre est traité en novembre)
export function dateOuverture(client: Client): string {
  return `${client.echeance.slice(0, 7)}-01`
}

// Tous les événements du dossier, du plus récent au plus ancien
export function activiteClient(client: Client): Evenement[] {
  const evenements: Evenement[] = [
    { type: 'ouverture', date: dateOuverture(client), nbPieces: client.pieces.length },
    ...client.pieces
      .filter((piece) => piece.statut === 'recue' && piece.recueLe)
      .map((piece): Evenement => ({ type: 'piece_recue', date: piece.recueLe!, piece })),
    ...client.relances.map((relance): Evenement => ({ type: 'relance', date: relance.date, relance })),
  ]
  return evenements.sort((a, b) => toDate(b.date).getTime() - toDate(a.date).getTime())
}

// Uniquement les relances (onglet « Mails envoyés »), de la plus récente à la plus ancienne
export function mailsEnvoyes(client: Client): Evenement[] {
  return activiteClient(client).filter((evenement) => evenement.type === 'relance')
}

// Regroupe des événements déjà triés par jour, avec un libellé lisible (timeline façon Shopify)
export function grouperParJour(evenements: Evenement[], now: Date): JourActivite[] {
  const aujourdhui = toDateKey(now)
  const hier = toDateKey(new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1))
  const jours: JourActivite[] = []

  for (const evenement of evenements) {
    const date = toDate(evenement.date)
    const cle = toDateKey(date)
    let jour = jours.at(-1)
    if (jour?.cle !== cle) {
      const libelle = cle === aujourdhui ? "Aujourd'hui" : cle === hier ? 'Hier' : formatJourMois(date)
      jour = { cle, libelle, evenements: [] }
      jours.push(jour)
    }
    jour.evenements.push(evenement)
  }
  return jours
}
