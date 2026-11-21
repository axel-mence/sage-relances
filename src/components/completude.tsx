type CompletudeProps = {
  // Pourcentage de pièces reçues (0 à 100)
  value: number
  // Variante large pour la fiche client
  size?: 'sm' | 'lg'
}

/*
  Complétude d'un dossier : petite jauge verte + pourcentage.
  Reste dans la bichromie du DS : vert pour la part reçue, gris clair pour le reste.
  Le texte porte l'information, la jauge n'est qu'un repère visuel.
*/
export function Completude({ value, size = 'sm' }: CompletudeProps) {
  const complet = value === 100
  return (
    <span className="flex items-center gap-2">
      <span
        aria-hidden="true"
        className={`overflow-hidden rounded-full bg-border ${size === 'lg' ? 'h-2 flex-1' : 'h-1.5 w-12'}`}
      >
        <span className="block h-full rounded-full bg-accent" style={{ width: `${value}%` }} />
      </span>
      <span className={`text-label tabular-nums ${complet ? 'text-accent-strong' : 'text-primary'}`}>
        {value} %<span className="sr-only"> de pièces reçues</span>
      </span>
    </span>
  )
}
