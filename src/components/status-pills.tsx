import { GROUPS } from '../domain/filters'
import type { DossierStatus } from '../domain/types'

// Couleur de la pastille de chaque état : celle du badge de statut correspondant
// En Nudge : mêmes couleurs que les chips de statut (le noir de « Relancés » serait invisible sur fond sombre)
const DOT: Record<DossierStatus, string> = {
  en_retard: 'bg-status-retard nudge:bg-alert',
  en_attente: 'bg-status-attente nudge:bg-nudge-muted',
  relancee: 'bg-status-relancee nudge:bg-lime',
  complet: 'bg-accent nudge:bg-green',
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
            className={[
              'flex h-8 cursor-pointer items-center gap-2 rounded-sm border border-border bg-surface px-3 text-label text-secondary transition-colors hover:border-primary hover:text-primary',
              // Nudge : fond sombre, filet blanc discret, texte clair
              'nudge:border-white/10 nudge:bg-surface-2 nudge:text-nudge-muted nudge:hover:border-white/40 nudge:hover:text-mist',
            ].join(' ')}
          >
            <span aria-hidden="true" className={`size-2 rounded-full ${DOT[group.status]}`} />
            {group.label}
            <span className="text-primary tabular-nums nudge:text-mist">{counts[group.status]}</span>
          </button>
        </li>
      ))}
    </ul>
  )
}
