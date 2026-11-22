import { formatDuree } from '../domain/format'
import { useKpis } from '../hooks/kpis-context'

type TimeSavedProps = {
  // « sidebar » : bloc complet de la barre latérale ; « compact » : une ligne pour la barre du haut sur mobile
  variant?: 'sidebar' | 'compact'
}

/*
  Temps gagné cette semaine, à l'échelle du cabinet : le bénéfice principal de la feature (spec, section 4).
  Placé dans la barre latérale, à la place du nom du cabinet (choix d'Axel) : visible sur toutes les pages.
  Style DS : icône d'horloge devant le libellé, chiffre en Sora (style « Titre section »), calcul en légende.
*/
export function TimeSaved({ variant = 'sidebar' }: TimeSavedProps) {
  const { data, loading, error } = useKpis()

  if (variant === 'compact') {
    if (loading || error || !data) return null
    return (
      <span className="text-label text-primary tabular-nums">
        <span className="font-display">{formatDuree(data.tempsGagneMinutes)}</span>
        <span className="text-secondary"> gagnées</span>
      </span>
    )
  }

  return (
    <div aria-busy={loading || undefined} className="flex flex-col gap-1">
      {/* Icône d'horloge simple (même trait que les pictos de la navigation) devant le libellé */}
      <span className="flex items-center gap-1.5 text-caption text-secondary">
        <svg aria-hidden="true" viewBox="0 0 16 16" className="size-3.5 shrink-0">
          <circle cx="8" cy="8" r="6.25" fill="none" stroke="currentColor" strokeWidth="1.4" />
          <path d="M8 4.75V8l2.25 1.5" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        Temps gagné cette semaine
      </span>

      {loading ? (
        <span aria-hidden="true" className="my-1 h-7 w-24 animate-pulse rounded-sm bg-surface-2" />
      ) : error || !data ? (
        <span className="text-label text-muted">Indisponible</span>
      ) : (
        <span className="font-display text-section text-primary tabular-nums">{formatDuree(data.tempsGagneMinutes)}</span>
      )}

      {!loading && !error && data && (
        <span className="text-caption text-muted tabular-nums">{data.relancesSemaine} relances en un clic · à l'échelle du cabinet</span>
      )}
    </div>
  )
}
