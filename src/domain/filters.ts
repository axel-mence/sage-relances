import type { DossierStatus } from './types'

export type StatusFilter = 'tous' | DossierStatus

// Ordre et libellés des onglets de statut (spec, parcours étape 2)
export const TABS: { value: StatusFilter; label: string }[] = [
  { value: 'tous', label: 'Tous' },
  { value: 'en_retard', label: 'En retard' },
  { value: 'en_attente', label: 'En attente' },
  { value: 'relancee', label: 'Relancés' },
  { value: 'complet', label: 'Complets' },
]
