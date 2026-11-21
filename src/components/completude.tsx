import { niveauCompletude, type NiveauCompletude } from '../domain/status'

/*
  Couleur par seuil, jauge et texte, en 2 looks (contraste AA vérifié sur chaque fond) :
  - DS v1 : rouge / orange / vert du DS
  - Nudge (nudge:) : alert (orange vif) / lime (jaune-vert) / green
*/
const COULEURS: Record<NiveauCompletude, { jauge: string; texte: string }> = {
  faible: { jauge: 'bg-status-retard nudge:bg-alert', texte: 'text-status-retard nudge:text-alert' },
  moyen: { jauge: 'bg-status-attente nudge:bg-lime', texte: 'text-status-attente nudge:text-lime' },
  bon: { jauge: 'bg-accent nudge:bg-green', texte: 'text-accent-strong nudge:text-green' },
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
        className={`overflow-hidden rounded-full bg-border nudge:bg-white/10 ${size === 'lg' ? 'h-2 flex-1' : 'h-1.5 w-12 lg:hidden xl:block'}`}
      >
        <span className={`block h-full rounded-full ${couleur.jauge}`} style={{ width: `${value}%` }} />
      </span>
      <span className={`tabular-nums whitespace-nowrap ${size === 'lg' ? 'text-label' : 'w-12 text-right'} ${couleur.texte}`}>
        {value} %<span className="sr-only"> de pièces reçues</span>
      </span>
    </span>
  )
}
