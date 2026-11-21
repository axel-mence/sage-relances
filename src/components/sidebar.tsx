import { NOM_CABINET, UTILISATEUR_CONNECTE } from '../api/clients-api'
import { Avatar } from './avatar'
import { NavIcon, type NavIconName } from './nav-icon'
import { NudgeLogo } from './nudge-logo'
import { ThemeToggle } from './theme-toggle'

type NavItem = { label: string; icon: NavIconName; active?: boolean }

// Seul le tableau de bord existe en V1 : les autres entrées sont visibles mais inactives (spec, écran 01)
const MAIN_ITEMS: NavItem[] = [
  { label: 'Tableau de bord', icon: 'home', active: true },
  { label: 'Clients', icon: 'clients' },
  { label: 'Relances', icon: 'relances' },
]

// Entrées secondaires, en bas de la barre (comme l'administration chez n8n)
const FOOTER_ITEMS: NavItem[] = [
  { label: 'Paramètres', icon: 'parametres' },
  { label: 'Aide', icon: 'aide' },
]

// Base commune des lignes de navigation : picto + libellé, hauteur 40 px
const ROW = 'flex h-10 items-center gap-3 rounded-sm px-3 text-body'

function NavLink({ item }: { item: NavItem }) {
  if (item.active) {
    return (
      <a href="/" aria-current="page" className={`${ROW} bg-accent-subtle font-medium text-accent`}>
        <NavIcon name={item.icon} />
        {item.label}
      </a>
    )
  }
  return (
    <span aria-disabled="true" title="Bientôt" className={`${ROW} cursor-not-allowed text-secondary`}>
      <NavIcon name={item.icon} />
      {item.label}
      <span className="ml-auto text-caption text-muted">Bientôt</span>
    </span>
  )
}

function NavList({ items }: { items: NavItem[] }) {
  return (
    <ul className="flex flex-col gap-1">
      {items.map((item) => (
        <li key={item.label}>
          <NavLink item={item} />
        </li>
      ))}
    </ul>
  )
}

/*
  Barre latérale sur grand écran (lg et plus), sur le fond dégradé Nudge du thème actif (clair ou sombre).
  Structure reprise de n8n : navigation principale, section « Cabinet », thème et entrées secondaires en bas,
  puis le bloc utilisateur. Collée en haut (sticky) et haute d'un écran exactement :
  elle ne défile jamais avec la page, et le bloc utilisateur reste toujours visible en bas.
*/
export function Sidebar() {
  return (
    <aside className="bg-nudge-light dark:bg-nudge-dark sticky top-0 hidden h-dvh w-60 shrink-0 flex-col overflow-y-auto border-r border-border lg:flex">
      <div className="px-6 pt-6 pb-4">
        <NudgeLogo className="h-7 text-primary" />
      </div>

      <nav aria-label="Navigation principale" className="flex flex-1 flex-col">
        <div className="px-3 pb-4">
          <NavList items={MAIN_ITEMS} />
        </div>

        {/* Section « Cabinet » séparée par des filets, comme « Projects » chez n8n */}
        <div className="flex flex-col gap-2 border-y border-border px-3 py-4">
          <span className="px-3 text-caption text-muted">Cabinet</span>
          <span className={`${ROW} text-primary`}>
            <NavIcon name="cabinet" />
            {NOM_CABINET}
          </span>
        </div>

        {/* Pastille clair / sombre juste au-dessus des entrées secondaires */}
        <div className="mt-auto flex flex-col gap-4 px-3 py-4">
          <div className="px-3">
            <ThemeToggle />
          </div>
          <NavList items={FOOTER_ITEMS} />
        </div>
      </nav>

      <div className="border-t border-border px-6 py-4">
        <div className="flex items-center gap-3">
          <Avatar />
          <div className="flex min-w-0 flex-col">
            <span className="text-label text-primary">{UTILISATEUR_CONNECTE}</span>
            <span className="text-caption text-secondary">Associée</span>
          </div>
        </div>
      </div>
    </aside>
  )
}

// Barre du haut sur mobile et tablette, à la place de la barre latérale
export function MobileTopBar() {
  return (
    <header className="flex h-14 items-center justify-between border-b border-border bg-surface px-4 lg:hidden">
      <div className="flex items-center gap-3">
        <NudgeLogo variant="mark" className="h-7 text-accent" />
        <span className="text-label text-primary">{NOM_CABINET}</span>
      </div>
      <div className="flex items-center gap-3">
        <ThemeToggle compact />
        {/* Sur mobile, l'avatar seul : le nom est lu grâce au texte masqué */}
        <span className="sr-only">{UTILISATEUR_CONNECTE}</span>
        <Avatar size="sm" />
      </div>
    </header>
  )
}
