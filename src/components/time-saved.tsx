import { formatDuree } from '../domain/format'

type TimeSavedProps = {
  minutes?: number
  relances?: number
  loading: boolean
  error: boolean
}

/*
  Temps gagné mis en avant dans l'en-tête, sans carte (choix d'Axel) : style « Titre page » du DS
  (Sora SemiBold 32, réduit à la demande d'Axel), un filet accent à gauche pour le détacher du titre, et le calcul en légende.
  C'est le bénéfice principal de la feature (spec, section 4) : il doit se lire en premier.
*/
export function TimeSaved({ minutes, relances, loading, error }: TimeSavedProps) {
  return (
    <div aria-busy={loading || undefined} className="flex flex-col gap-1 border-l-2 border-accent pl-4">
      <span className="text-label text-secondary">Temps gagné cette semaine</span>

      {loading ? (
        <span aria-hidden="true" className="my-1 h-10 w-28 animate-pulse rounded-sm bg-surface-2" />
      ) : error || minutes === undefined ? (
        <span className="font-display text-section text-muted">Indisponible</span>
      ) : (
        <span className="font-display text-title text-primary tabular-nums">{formatDuree(minutes)}</span>
      )}

      {!loading && !error && relances !== undefined && (
        <span className="text-caption text-muted tabular-nums">
          {relances} relances en un clic · à l'échelle du cabinet
        </span>
      )}
    </div>
  )
}
