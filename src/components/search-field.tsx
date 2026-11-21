type SearchFieldProps = {
  value: string
  onChange: (value: string) => void
  // Id unique du champ : la liste et l'annuaire ont chacun le leur (les 2 pages restent montées)
  id?: string
}

// Barre de recherche de la liste : filtre par nom de client ou de collaborateur
export function SearchField({ value, onChange, id = 'recherche-client' }: SearchFieldProps) {
  return (
    <div className="relative w-full sm:max-w-sm lg:max-w-xs">
      <label htmlFor={id} className="sr-only">
        Rechercher un client ou un collaborateur
      </label>
      {/* Loupe décorative */}
      <svg
        aria-hidden="true"
        viewBox="0 0 16 16"
        className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-secondary"
      >
        <circle cx="7" cy="7" r="4.5" fill="none" stroke="currentColor" strokeWidth="1.5" />
        <path d="M10.5 10.5L14 14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
      <input
        id={id}
        type="search"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        // Échap vide le champ
        onKeyDown={(event) => event.key === 'Escape' && onChange('')}
        placeholder="Rechercher un client ou un collaborateur"
        autoComplete="off"
        className="h-10 w-full rounded-md border border-border bg-surface pr-3 pl-9 text-body text-primary placeholder:text-muted hover:border-secondary focus:border-primary"
      />
    </div>
  )
}
