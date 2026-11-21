import { niveauCompletude, type NiveauCompletude } from '../domain/status'

// Couleur par seuil (couleurs de statut du DS) : jauge et texte, texte au contraste AA sur blanc
const COULEURS: Record<NiveauCompletude, { jauge: string; texte: string }> = {
  faible: { jauge: 'bg-status-retard', texte: 'text-status-retard' },
  moyen: { jauge: 'bg-status-attente', texte: 'text-status-attente' },
  bon: { jauge: 'bg-accent', texte: 'text-accent-strong' },
}

type CompletudeProps = {
  // Pourcentage de pièces reçues (0 à 100)
  value: number
  // Variante large pour la fiche client
  size?: 'sm' | 'lg'
}

/*
  Complétude d'un dossier : petite jauge + pourcentage, colorés selon le seuil
  (rouge sous 50 %, jaune de 50 à 79 %, vert à partir de 80 %).
  Le texte porte l'information, la jauge n'est qu'un repère visuel.
*/
export function Completude({ value, size = 'sm' }: CompletudeProps) {
  const couleur = COULEURS[niveauCompletude(value)]
  return (
    <span className={`flex items-center gap-2 ${size === 'sm' ? 'justify-end' : ''}`}>
      <span
        aria-hidden="true"
        // Petite jauge masquée entre 1024 et 1280 px (tableau trop étroit) : le pourcentage reste
        className={`overflow-hidden rounded-full bg-border ${size === 'lg' ? 'h-2 flex-1' : 'h-1.5 w-12 lg:hidden xl:block'}`}
      >
        <span className={`block h-full rounded-full ${couleur.jauge}`} style={{ width: `${value}%` }} />
      </span>
      <span className={`tabular-nums ${size === 'lg' ? 'text-label' : 'w-11 text-right'} ${couleur.texte}`}>
        {value} %<span className="sr-only"> de pièces reçues</span>
      </span>
    </span>
  )
}
