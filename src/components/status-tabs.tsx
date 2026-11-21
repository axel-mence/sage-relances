import { useRef, type KeyboardEvent } from 'react'
import { TABS, type StatusFilter } from '../domain/filters'

type StatusTabsProps = {
  value: StatusFilter
  // Absent tant que la liste n'est pas chargée : on n'affiche pas de faux « 0 »
  counts?: Record<StatusFilter, number>
  onChange: (value: StatusFilter) => void
  // id du contenu piloté par les onglets (lien accessible onglet → liste)
  panelId: string
}

/*
  Onglets accessibles (modèle WAI-ARIA « tabs ») :
  Tab entre dans les onglets sur l'onglet actif, les flèches gauche/droite passent d'un onglet à l'autre,
  Début/Fin vont au premier/dernier.
*/
export function StatusTabs({ value, counts, onChange, panelId }: StatusTabsProps) {
  const refs = useRef<(HTMLButtonElement | null)[]>([])

  function handleKeyDown(event: KeyboardEvent, index: number) {
    const last = TABS.length - 1
    const next =
      event.key === 'ArrowRight' ? (index === last ? 0 : index + 1)
      : event.key === 'ArrowLeft' ? (index === 0 ? last : index - 1)
      : event.key === 'Home' ? 0
      : event.key === 'End' ? last
      : null
    if (next === null) return

    event.preventDefault()
    onChange(TABS[next].value)
    refs.current[next]?.focus()
  }

  return (
    // Défilement horizontal sur petit écran plutôt qu'un retour à la ligne
    <div className="-mx-4 overflow-x-auto px-4 sm:mx-0 sm:px-0">
      <div role="tablist" aria-label="Filtrer par statut" className="flex min-w-max gap-1 border-b border-border">
        {TABS.map((tab, index) => {
          const selected = tab.value === value
          return (
            <button
              key={tab.value}
              ref={(el) => {
                refs.current[index] = el
              }}
              type="button"
              role="tab"
              id={`tab-${tab.value}`}
              aria-selected={selected}
              aria-controls={panelId}
              tabIndex={selected ? 0 : -1}
              onClick={() => onChange(tab.value)}
              onKeyDown={(event) => handleKeyDown(event, index)}
              className={`-mb-px flex h-10 cursor-pointer items-center gap-2 border-b-2 px-3 text-label transition-colors ${
                selected ? 'border-primary text-primary' : 'border-transparent text-secondary hover:text-primary'
              }`}
            >
              {tab.label}
              {counts && (
                <span
                  className={`rounded-sm px-1.5 text-caption tabular-nums ${
                    selected ? 'bg-primary text-white' : 'bg-status-relancee-bg text-secondary'
                  }`}
                >
                  {counts[tab.value]}
                </span>
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}
