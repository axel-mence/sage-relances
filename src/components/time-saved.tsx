import { formatDuree } from '../domain/format'

type TimeSavedProps = {
  minutes?: number
  relances?: number
  loading: boolean
  error: boolean
}

/*
  Temps gagné mis en avant dans l'en-tête, sans carte : un grand chiffre vert,
  un filet vertical à gauche pour le détacher du titre, et le calcul en légende.
  C'est le bénéfice principal de la feature (spec, section 4) : il doit se lire en premier.
*/
export function TimeSaved({ minutes, relances, loading, error }: TimeSavedProps) {
  return (
    <div aria-busy={loading || undefined} className="flex flex-col gap-0.5 border-l-2 border-accent pl-4">
      <span className="text-caption text-secondary">Temps gagné cette semaine</span>

      {loading ? (
        <span aria-hidden="true" className="my-1 h-7 w-24 animate-pulse rounded-sm bg-border" />
      ) : error || minutes === undefined ? (
        <span className="text-section text-muted">Indisponible</span>
      ) : (
        <span className="text-kpi tabular-nums text-accent-strong">{formatDuree(minutes)}</span>
      )}

      {!loading && !error && relances !== undefined && (
        <span className="text-caption text-secondary tabular-nums">
          {relances} relances en un clic · à l'échelle du cabinet
        </span>
      )}
    </div>
  )
}
