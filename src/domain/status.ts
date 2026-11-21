import type { Client, DossierStatus, Relance } from './types'

// Une relance compte comme « récente » pendant 3 jours (spec, section 9)
export const RELANCE_RECENTE_JOURS = 3

const JOUR_MS = 24 * 60 * 60 * 1000

// Date du jour au format AAAA-MM-JJ, en heure locale (pour comparer avec l'échéance)
export function toDateKey(date: Date): string {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

export function piecesManquantes(client: Client) {
  return client.pieces.filter((piece) => piece.statut === 'manquante')
}

// Complétude d'un dossier : part des pièces attendues déjà reçues, en % arrondi (0 à 100)
export function tauxCompletude(client: Client): number {
  if (client.pieces.length === 0) return 100
  const recues = client.pieces.filter((piece) => piece.statut === 'recue').length
  return Math.round((recues / client.pieces.length) * 100)
}

// Seuils de couleur de la complétude : rouge sous 50 %, jaune de 50 à 79 %, vert à partir de 80 %
export const SEUIL_COMPLETUDE_MOYEN = 50
export const SEUIL_COMPLETUDE_BON = 80

export type NiveauCompletude = 'faible' | 'moyen' | 'bon'

export function niveauCompletude(taux: number): NiveauCompletude {
  if (taux >= SEUIL_COMPLETUDE_BON) return 'bon'
  if (taux >= SEUIL_COMPLETUDE_MOYEN) return 'moyen'
  return 'faible'
}

export function derniereRelance(client: Client): Relance | undefined {
  return [...client.relances].sort((a, b) => b.date.localeCompare(a.date))[0]
}

/*
  Règle de statut, appliquée dans cet ordre :
  1. Toutes les pièces reçues → complet
  2. Relance il y a moins de 3 jours → relancee
  3. Échéance dépassée → en_retard
  4. Sinon → en_attente

  Écart assumé avec l'ordre de la spec (qui met le retard avant la relance) :
  sans ça, relancer un client en retard ne changerait pas son statut, ce qui contredit
  le parcours et les critères d'acceptation (« Relancer » passe le statut à « Relancée »).
*/
export function computeStatus(client: Client, now: Date): DossierStatus {
  if (piecesManquantes(client).length === 0) return 'complet'

  const relance = derniereRelance(client)
  if (relance && now.getTime() - new Date(relance.date).getTime() < RELANCE_RECENTE_JOURS * JOUR_MS) {
    return 'relancee'
  }

  // Comparaison de chaînes AAAA-MM-JJ : l'échéance est dépassée le lendemain du jour J
  if (client.echeance < toDateKey(now)) return 'en_retard'

  return 'en_attente'
}
