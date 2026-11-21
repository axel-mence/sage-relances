import { useRef, type KeyboardEvent, type ReactNode } from 'react'

export type TabItem<T extends string> = {
  value: T
  label: string
  count?: number
}

type TabsProps<T extends string> = {
  // Préfixe des ids : onglet « {idPrefix}-tab-{value} », panneau « {idPrefix}-panel-{value} »
  idPrefix: string
  label: string // nom de la rangée d'onglets pour les lecteurs d'écran
  items: TabItem<T>[]
  value: T
  onChange: (value: T) => void
}

// Ids partagés entre l'onglet et son panneau (aria-controls / aria-labelledby)
const tabId = (prefix: string, value: string) => `${prefix}-tab-${value}`
const panelId = (prefix: string, value: string) => `${prefix}-panel-${value}`

/*
  Onglets du DS Nudge (nouveau composant validé dans la spec, section 8) :
  libellé Inter Medium 14, compteur en caption, soulignement accent de 2 px sous l'onglet actif,
  filet border sous la rangée.
  Clavier (modèle ARIA « tabs ») : seul l'onglet actif est dans l'ordre de tabulation,
  les flèches gauche / droite passent à l'onglet voisin, Début / Fin au premier / dernier.
*/
export function Tabs<T extends string>({ idPrefix, label, items, value, onChange }: TabsProps<T>) {
  const refs = useRef<(HTMLButtonElement | null)[]>([])

  function handleKeyDown(event: KeyboardEvent, index: number) {
    const last = items.length - 1
    const cible =
      event.key === 'ArrowRight' ? (index === last ? 0 : index + 1)
      : event.key === 'ArrowLeft' ? (index === 0 ? last : index - 1)
      : event.key === 'Home' ? 0
      : event.key === 'End' ? last
      : undefined
    if (cible === undefined) return
    event.preventDefault()
    onChange(items[cible].value)
    refs.current[cible]?.focus()
  }

  return (
    <div role="tablist" aria-label={label} className="flex gap-6 border-b border-border">
      {items.map((item, index) => {
        const active = item.value === value
        return (
          <button
            key={item.value}
            ref={(element) => {
              refs.current[index] = element
            }}
            type="button"
            role="tab"
            id={tabId(idPrefix, item.value)}
            aria-selected={active}
            aria-controls={panelId(idPrefix, item.value)}
            tabIndex={active ? 0 : -1}
            onClick={() => onChange(item.value)}
            onKeyDown={(event) => handleKeyDown(event, index)}
            className={`-mb-px flex cursor-pointer items-center gap-1.5 border-b-2 py-3 text-label transition-colors ${
              active ? 'border-accent text-primary' : 'border-transparent text-secondary hover:text-primary'
            }`}
          >
            {item.label}
            {item.count !== undefined && <span className="text-caption text-muted tabular-nums">{item.count}</span>}
          </button>
        )
      })}
    </div>
  )
}

type TabPanelProps = {
  idPrefix: string
  value: string
  children: ReactNode
  className?: string
}

// Contenu d'un onglet, relié à son onglet pour les lecteurs d'écran
export function TabPanel({ idPrefix, value, children, className = '' }: TabPanelProps) {
  return (
    <div role="tabpanel" tabIndex={0} id={panelId(idPrefix, value)} aria-labelledby={tabId(idPrefix, value)} className={className}>
      {children}
    </div>
  )
}
