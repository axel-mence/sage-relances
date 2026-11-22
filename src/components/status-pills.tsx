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
  Pastilles de filtre d'un clic : Tous, En retard, En attente, Relancés, Complets.
  Style « contrôle segmenté » (référence fournie par Axel) : un conteneur gris arrondi,
  la pastille active ressort en blanc avec une ombre légère, les autres restent à plat.
  En sombre, on inverse les surfaces pour que la pastille active reste la plus claire.
  Sur mobile, la rangée défile à l'horizontale au lieu de passer à la ligne.
  aria-pressed annonce laquelle est choisie.
*/
export function StatusPills({ counts, value, onChange }: StatusPillsProps) {
  return (
    <div
      role="group"
      aria-label="Filtrer par statut"
      className="flex w-fit max-w-full gap-0.5 overflow-x-auto rounded-sm bg-surface-2 p-1 dark:bg-surface"
    >
      {FILTERS.map((filter) => {
        const active = filter.value === value
        const dot = DOT[filter.value]
        return (
          <button
            key={filter.value}
            type="button"
            aria-pressed={active}
            onClick={() => onChange(filter.value)}
            className={`flex h-8 shrink-0 cursor-pointer items-center gap-2 rounded-xs px-3 text-label whitespace-nowrap transition-colors focus-visible:outline-offset-0 ${
              active
                ? 'bg-surface text-primary shadow-xs dark:bg-surface-2'
                : 'text-secondary hover:text-primary'
            }`}
          >
            {dot && <span aria-hidden="true" className={`size-2 rounded-full ${dot}`} />}
            {filter.label}
            <span className={`tabular-nums ${active ? 'text-primary' : 'text-muted'}`}>{counts[filter.value]}</span>
          </button>
        )
      })}
    </div>
  )
}
