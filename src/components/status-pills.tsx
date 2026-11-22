import { FILTERS, type StatusFilter } from '../domain/filters'

/*
  Pastille sélectionnée : aux couleurs de son état (mêmes tokens que le badge de statut),
  pour qu'on voie d'un coup d'œil quel filtre est actif. « Tous » reste neutre (blanc, ombre légère).
*/
const ACTIVE: Record<StatusFilter, string> = {
  tous: 'bg-surface text-primary shadow-xs dark:bg-surface-2',
  en_retard: 'bg-status-retard-bg text-status-retard',
  en_attente: 'bg-status-attente-bg text-status-attente',
  relancee: 'bg-status-relancee-bg text-status-relancee',
  complet: 'bg-status-recue-bg text-status-recue',
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
  la pastille active prend la couleur de son état (sans point de couleur), les autres restent à plat.
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
        return (
          <button
            key={filter.value}
            type="button"
            aria-pressed={active}
            onClick={() => onChange(filter.value)}
            className={`flex h-8 shrink-0 cursor-pointer items-center gap-2 rounded-xs px-3 text-label whitespace-nowrap transition-colors focus-visible:outline-offset-0 ${
              active ? ACTIVE[filter.value] : 'text-secondary hover:text-primary'
            }`}
          >
            {filter.label}
            <span className={`tabular-nums ${active ? '' : 'text-muted'}`}>{counts[filter.value]}</span>
          </button>
        )
      })}
    </div>
  )
}
