import { Card } from './card'

type KeyFigureProps = {
  label: string
  value: string
  // Précision sous le chiffre, ex. « sur 180 dossiers »
  context?: string
}

/*
  Carte KPI du DS Nudge v2 (composant Figma « Carte KPI ») :
  libellé Inter Medium 14 gris, chiffre Sora Bold 48/52 (interlettrage -5 %), légende Inter 12 gris clair.
*/
export function KeyFigure({ label, value, context }: KeyFigureProps) {
  return (
    <Card className="flex flex-col gap-1">
      <span className="text-label text-secondary">{label}</span>
      <span className="font-display text-kpi text-primary tabular-nums">{value}</span>
      {context && <span className="text-caption text-muted">{context}</span>}
    </Card>
  )
}
