import type { DossierStatus } from './types'

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
