import type { DossierStatus } from '../domain/types'

// Libellé et couleurs de chaque statut (tokens du DS v1)
const STATUS_STYLES: Record<DossierStatus, { label: string; className: string; dot: string }> = {
  en_retard: { label: 'En retard', className: 'bg-status-retard-bg text-status-retard', dot: 'bg-status-retard' },
  en_attente: { label: 'En attente', className: 'bg-status-attente-bg text-status-attente', dot: 'bg-status-attente' },
  relancee: { label: 'Relancée', className: 'bg-status-relancee-bg text-status-relancee', dot: 'bg-status-relancee' },
  complet: { label: 'Complet', className: 'bg-accent-subtle text-accent-strong', dot: 'bg-accent' },
}

type StatusBadgeProps = {
  status: DossierStatus
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const style = STATUS_STYLES[status]

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-sm px-2 py-0.5 text-label whitespace-nowrap ${style.className}`}
    >
      {/* Pastille décorative : le libellé porte l'information, la couleur ne suffit jamais seule */}
      <span aria-hidden="true" className={`size-1.5 rounded-full ${style.dot}`} />
      {style.label}
    </span>
  )
}
