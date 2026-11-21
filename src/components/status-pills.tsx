import { GROUPS } from '../domain/filters'
import type { DossierStatus } from '../domain/types'

// Couleur du point de chaque état : celle du badge de statut correspondant (suit le mode clair ou sombre)
const DOT: Record<DossierStatus, string> = {
  en_retard: 'bg-status-retard',
  en_attente: 'bg-status-attente',
  relancee: 'bg-status-relancee',
  complet: 'bg-status-recue',
}

type StatusPillsProps = {
  counts: Record<DossierStatus, number>
  // Ouvre le groupe du statut choisi dans la liste et fait défiler jusqu'à lui
  onSelect: (status: DossierStatus) => void
}

// Pastilles d'état cliquables (un raccourci vers chaque groupe de la liste)
export function StatusPills({ counts, onSelect }: StatusPillsProps) {
  return (
    <ul className="flex flex-wrap gap-2" aria-label="Aller au groupe">
      {GROUPS.map((group) => (
        <li key={group.status}>
          <button
            type="button"
            onClick={() => onSelect(group.status)}
            className="flex h-9 cursor-pointer items-center gap-2 rounded-sm border border-border bg-surface px-3 text-label text-secondary transition-colors hover:border-secondary hover:text-primary"
          >
            <span aria-hidden="true" className={`size-2 rounded-full ${DOT[group.status]}`} />
            {group.label}
            <span className="text-primary tabular-nums">{counts[group.status]}</span>
          </button>
        </li>
      ))}
    </ul>
  )
}
