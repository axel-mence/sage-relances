import type { DossierStatus } from './types'

// Groupes de la liste (note N1), dans l'ordre d'affichage : le plus urgent en haut
export const GROUPS: { status: DossierStatus; label: string; openByDefault: boolean }[] = [
  { status: 'en_retard', label: 'En retard', openByDefault: true },
  { status: 'en_attente', label: 'En attente', openByDefault: true },
  { status: 'relancee', label: 'Relancés', openByDefault: true },
  // Rien à faire sur un dossier complet : replié par défaut
  { status: 'complet', label: 'Complets', openByDefault: false },
]

// id du bloc de chaque groupe : sert au lien accessible et au défilement depuis les pastilles de la barre
export const groupId = (status: DossierStatus) => `groupe-${status}`

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
