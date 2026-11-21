// Modèle de données de la feature (spec, section 9).
// Les noms métier restent en français pour coller à la spec.

export type DocumentStatus = 'recue' | 'manquante'

// Statut d'un dossier client : toujours calculé (voir status.ts), jamais stocké
export type DossierStatus = 'complet' | 'en_attente' | 'en_retard' | 'relancee'

export interface Collaborateur {
  id: string
  nom: string
}

export interface PieceAttendue {
  id: string
  libelle: string // "Relevé bancaire octobre"
  statut: DocumentStatus
  recueLe?: string // date ISO
}

export interface Relance {
  id: string
  date: string // date et heure ISO
  par: string // nom de la personne ou "Système"
  pieces: string[] // ids des pièces concernées
  canal: 'mail'
}

export interface Client {
  id: string
  nom: string
  collaborateurId: string
  regimeTva: 'mensuelle' | 'trimestrielle'
  echeance: string // date ISO (AAAA-MM-JJ)
  pieces: PieceAttendue[]
  relances: Relance[]
}

// Client enrichi par l'API : ce que l'écran affiche directement
export interface ClientView extends Client {
  statut: DossierStatus
  collaborateur: string // nom du collaborateur
  nbManquantes: number
  derniereRelance?: string // date ISO de la relance la plus récente
}

export interface Kpis {
  dossiersComplets: number
  totalDossiers: number
  enRetard: number
  relancesSemaine: number
  tempsGagneMinutes: number
}
