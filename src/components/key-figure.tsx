type KeyFigureProps = {
  value: string
  label: string
}

/*
  Chiffre clé Nudge (brief, section 4) : Sora 700 en très grand, clair sur fond vert sapin (teal).
  Taille réduite à 64 px sur grand écran (au lieu des 96 px du brief, validé avec Axel)
  pour ne pas écraser la liste, et 48 px sur mobile.
*/
export function KeyFigure({ value, label }: KeyFigureProps) {
  return (
    <div className="flex flex-col gap-1 rounded-card bg-teal px-6 py-5 text-mist sm:px-8 sm:py-6">
      <span className="font-display text-figure font-bold tracking-display tabular-nums lg:text-figure-lg">
        {value}
      </span>
      <span className="text-label text-mist/80">{label}</span>
    </div>
  )
}
