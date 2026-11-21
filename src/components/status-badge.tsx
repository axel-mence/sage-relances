import type { DossierStatus } from '../domain/types'

/*
  Libellé et couleurs de chaque statut, en 2 looks :
  - DS v1 (par défaut) : fond pâle + texte coloré + pastille
  - Nudge (préfixe nudge:, dans .theme-nudge) : chip pleine, texte noir Inter 600, sans pastille (brief, section 4)
    En retard → alert (orange), Relancée → lime, Complet → green.
    « En attente » n'existe pas dans le brief : simple contour gris, pour rester en retrait des 3 autres.
*/
const STATUS_STYLES: Record<DossierStatus, { label: string; className: string; dot: string }> = {
  en_retard: {
    label: 'En retard',
    className: 'bg-status-retard-bg text-status-retard nudge:bg-alert nudge:text-ink',
    dot: 'bg-status-retard',
  },
  en_attente: {
    label: 'En attente',
    className:
      'bg-status-attente-bg text-status-attente nudge:bg-transparent nudge:text-mist nudge:ring-1 nudge:ring-nudge-muted nudge:ring-inset',
    dot: 'bg-status-attente',
  },
  relancee: {
    label: 'Relancée',
    className: 'bg-status-relancee-bg text-status-relancee nudge:bg-lime nudge:text-ink',
    dot: 'bg-status-relancee',
  },
  complet: {
    label: 'Complet',
    className: 'bg-accent-subtle text-accent-strong nudge:bg-green nudge:text-ink',
    dot: 'bg-accent',
  },
}

type StatusBadgeProps = {
  status: DossierStatus
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const style = STATUS_STYLES[status]

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-sm px-2 py-0.5 text-label whitespace-nowrap nudge:font-semibold ${style.className}`}
    >
      {/* Pastille décorative en v1 (le libellé porte l'information) ; inutile en Nudge où la chip est pleine */}
      <span aria-hidden="true" className={`size-1.5 rounded-full nudge:hidden ${style.dot}`} />
      {style.label}
    </span>
  )
}
