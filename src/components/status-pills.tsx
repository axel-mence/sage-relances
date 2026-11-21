import { FILTERS, type StatusFilter } from '../domain/filters'

// Couleur du point de chaque statut : celle du badge correspondant (suit le mode clair ou sombre)
const DOT: Record<StatusFilter, string | null> = {
  tous: null,
  en_retard: 'bg-status-retard',
  en_attente: 'bg-status-attente',
  relancee: 'bg-status-relancee',
  complet: 'bg-status-recue',
}

type StatusPillsProps = {
  // Nombre de clients pour chaque filtre
  counts: Record<StatusFilter, number>
  value: StatusFilter
  onChange: (value: StatusFilter) => void
}

/*
  Pastilles de filtre d'un clic (format « filtres » de Stripe) : Tous, En retard, En attente, Relancés, Complets.
  La pastille active est encadrée par l'accent ; aria-pressed annonce laquelle est choisie.
*/
export function StatusPills({ counts, value, onChange }: StatusPillsProps) {
  return (
    <div role="group" aria-label="Filtrer par statut" className="flex flex-wrap gap-2">
      {FILTERS.map((filter) => {
        const active = filter.value === value
        const dot = DOT[filter.value]
        return (
          <button
            key={filter.value}
            type="button"
            aria-pressed={active}
            onClick={() => onChange(filter.value)}
            className={`flex h-9 cursor-pointer items-center gap-2 rounded-sm border px-3 text-label transition-colors ${
              active
                ? 'border-accent bg-surface-2 text-primary ring-1 ring-accent ring-inset'
                : 'border-border bg-surface text-secondary hover:border-secondary hover:text-primary'
            }`}
          >
            {dot && <span aria-hidden="true" className={`size-2 rounded-full ${dot}`} />}
            {filter.label}
            <span className="text-primary tabular-nums">{counts[filter.value]}</span>
          </button>
        )
      })}
    </div>
  )
}
