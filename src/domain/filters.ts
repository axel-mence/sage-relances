import { tauxCompletude } from './status'
import type { ClientView, DossierStatus } from './types'

// Filtre de la liste : tous les clients, ou un seul statut (pastilles d'un clic)
export type StatusFilter = 'tous' | DossierStatus

// Pastilles de filtre, dans l'ordre d'affichage
export const FILTERS: { value: StatusFilter; label: string }[] = [
  { value: 'tous', label: 'Tous' },
  { value: 'en_retard', label: 'En retard' },
  { value: 'en_attente', label: 'En attente' },
  { value: 'relancee', label: 'Relancés' },
  { value: 'complet', label: 'Complets' },
]

// Ordre d'urgence pour le tri de la liste : ce qui brûle d'abord, ce qui est réglé en dernier
export const URGENCE: DossierStatus[] = ['en_retard', 'en_attente', 'relancee', 'complet']

/*
  Tri par gravité : retard, attente, relancé, complet.
  À statut égal, la complétude la plus faible en haut (le plus de pièces à récupérer).
  À égalité, l'ordre d'arrivée est gardé (tri stable).
*/
export function parGravite(a: ClientView, b: ClientView): number {
  return URGENCE.indexOf(a.statut) - URGENCE.indexOf(b.statut) || tauxCompletude(a) - tauxCompletude(b)
}

// Tri choisi en cliquant sur un titre de colonne (sinon : tri par gravité)
export type TriColonne = { cle: 'completude' | 'pieces'; sens: 'asc' | 'desc' }

/*
  Tri par colonne, puis gravité à égalité (un client en retard passe avant un client en attente au même taux).
  - completude : taux de pièces reçues
  - pieces : nombre de pièces manquantes
*/
export function parColonne({ cle, sens }: TriColonne) {
  const valeur = (c: ClientView) => (cle === 'completude' ? tauxCompletude(c) : c.nbManquantes)
  return (a: ClientView, b: ClientView) =>
    (sens === 'asc' ? valeur(a) - valeur(b) : valeur(b) - valeur(a)) || parGravite(a, b)
}

// Clic sur un titre : décroissant, puis croissant, puis retour au tri par gravité
export function triSuivant(actuel: TriColonne | undefined, cle: TriColonne['cle']): TriColonne | undefined {
  if (actuel?.cle !== cle) return { cle, sens: 'desc' }
  return actuel.sens === 'desc' ? { cle, sens: 'asc' } : undefined
}
