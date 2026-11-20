// Statut d'un dossier client, toujours calculé (voir spec, section 9). Le modèle complet arrive à l'étape 3.
export type DossierStatus = 'complet' | 'en_attente' | 'en_retard' | 'relancee'
