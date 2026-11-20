type KpiCardProps = {
  label: string
  value?: string
  // Précision sous le chiffre, ex. « sur 180 dossiers »
  hint?: string
  tone?: 'default' | 'danger' | 'success'
  loading?: boolean
  // Donnée impossible à récupérer : affiche « Indisponible » (spec, section 8)
  unavailable?: boolean
}

const TONES = {
  default: 'text-primary',
  danger: 'text-status-retard',
  success: 'text-accent-strong',
}

export function KpiCard({ label, value, hint, tone = 'default', loading = false, unavailable = false }: KpiCardProps) {
  return (
    <div className="flex flex-col gap-2 rounded-lg border border-border bg-surface p-4" aria-busy={loading || undefined}>
      <span className="text-label text-secondary">{label}</span>

      {loading ? (
        // Squelette de chargement
        <span aria-hidden="true" className="h-9 w-20 animate-pulse rounded-sm bg-page" />
      ) : unavailable ? (
        <span className="text-section text-muted">Indisponible</span>
      ) : (
        <span className={`text-kpi ${TONES[tone]}`}>{value}</span>
      )}

      {hint && !loading && <span className="text-caption text-secondary">{hint}</span>}
    </div>
  )
}
