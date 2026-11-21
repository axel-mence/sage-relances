import type { DossierStatus } from '../domain/types'
import { StatusBadge } from './status-badge'

type StatusGroupHeaderProps = {
  status: DossierStatus
  label: string
  count: number
  open: boolean
  onToggle: () => void
  // id du contenu du groupe (lien accessible bouton → lignes)
  controlsId: string
}

/*
  En-tête d'un groupe de statut dépliable (note N1, DS v2 « StatusGroup ») :
  chevron + badge + compteur. C'est un vrai bouton : Entrée et Espace ouvrent et ferment le groupe,
  et aria-expanded annonce l'état aux lecteurs d'écran.
*/
export function StatusGroupHeader({ status, label, count, open, onToggle, controlsId }: StatusGroupHeaderProps) {
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-expanded={open}
      aria-controls={controlsId}
      aria-label={`${label}, ${count} dossier${count > 1 ? 's' : ''}`}
      // Contour de focus à l'intérieur du bouton (-outline-offset-2) : sinon il est rogné par le tableau
      className="flex w-full cursor-pointer items-center gap-3 rounded-sm px-2 py-2 text-left -outline-offset-2 hover:bg-surface-2"
    >
      {/* Chevron : pointe à droite fermé, vers le bas ouvert */}
      <svg
        aria-hidden="true"
        viewBox="0 0 16 16"
        className={`size-4 shrink-0 text-secondary transition-transform ${open ? 'rotate-90' : ''}`}
      >
        <path d="M6 4l4 4-4 4" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      <StatusBadge status={status} />
      <span className="text-label text-secondary tabular-nums">{count}</span>
    </button>
  )
}
