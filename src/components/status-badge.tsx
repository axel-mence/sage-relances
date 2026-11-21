import type { DossierStatus } from '../domain/types'

/*
  Badge de statut du DS Nudge v2 (composant Figma « Badge statut ») :
  fond teinté + point de 6 px + texte Inter Medium 14, angles de 6 px.
  Les couleurs suivent le mode (clair ou sombre) grâce aux tokens status-*.
  « Complet » utilise les couleurs « Reçue » du DS (toutes les pièces sont reçues).
*/
const STATUS_STYLES: Record<DossierStatus, { label: string; className: string; dot: string }> = {
  en_retard: { label: 'En retard', className: 'bg-status-retard-bg text-status-retard', dot: 'bg-status-retard' },
  en_attente: { label: 'En attente', className: 'bg-status-attente-bg text-status-attente', dot: 'bg-status-attente' },
  relancee: { label: 'Relancée', className: 'bg-status-relancee-bg text-status-relancee', dot: 'bg-status-relancee' },
  complet: { label: 'Complet', className: 'bg-status-recue-bg text-status-recue', dot: 'bg-status-recue' },
}

type StatusBadgeProps = {
  status: DossierStatus
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const style = STATUS_STYLES[status]

  return (
    <span className={`inline-flex items-center gap-2 rounded-xs px-3 py-1 text-label whitespace-nowrap ${style.className}`}>
      {/* Point décoratif : le libellé porte l'information, la couleur ne suffit jamais seule */}
      <span aria-hidden="true" className={`size-1.5 rounded-full ${style.dot}`} />
      {style.label}
    </span>
  )
}
