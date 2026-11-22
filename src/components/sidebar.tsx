import { UTILISATEUR_CONNECTE } from '../api/clients-api'
import { navigate } from '../hooks/use-route'
import { Avatar } from './avatar'
import { NavIcon, type NavIconName } from './nav-icon'
import { NudgeLogo } from './nudge-logo'
import { ThemeToggle } from './theme-toggle'
import { TimeSaved } from './time-saved'

type NavItem = {
  label: string
  icon: NavIconName
  // Adresse de la page ; sans adresse, l'entrée est inactive (« Bientôt »)
  path?: string
  // L'entrée est active sur ces adresses (« Clients » reste active sur les fiches)
  match?: (path: string) => boolean
}

/*
  « Tableau de bord » : pièces manquantes et relance rapide (panneau à droite).
  « Clients » : annuaire et pages clients (spec-clients-relances, partie 1).
  « Relances » arrive avec la partie 2 : visible mais inactive.
*/
const MAIN_ITEMS: NavItem[] = [
  { label: 'Tableau de bord', icon: 'home', path: '/', match: (path) => path === '/' },
  { label: 'Clients', icon: 'clients', path: '/clients', match: (path) => path.startsWith('/clients') },
  { label: 'Relances', icon: 'relances' },
]

// Entrées secondaires, en bas de la barre (comme l'administration chez n8n)
const FOOTER_ITEMS: NavItem[] = [
  { label: 'Paramètres', icon: 'parametres' },
  { label: 'Aide', icon: 'aide' },
]

// Base commune des lignes de navigation : picto + libellé, hauteur 40 px
const ROW = 'flex h-10 items-center gap-3 rounded-sm px-3 text-body'

function NavLink({ item, path }: { item: NavItem; path: string }) {
  if (item.path) {
    const target = item.path
    const active = item.match?.(path) ?? false
    return (
      <a
        href={target}
        aria-current={active ? 'page' : undefined}
        // Navigation sans rechargement : les pages gardent leurs données
        onClick={(event) => {
          event.preventDefault()
          navigate(target)
        }}
        className={`${ROW} ${active ? 'bg-accent-subtle font-medium text-accent' : 'text-secondary hover:bg-surface-2 hover:text-primary'}`}
      >
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

function NavList({ items, path }: { items: NavItem[]; path: string }) {
  return (
    <ul className="flex flex-col gap-1">
      {items.map((item) => (
        <li key={item.label}>
          <NavLink item={item} path={path} />
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
export function Sidebar({ path }: { path: string }) {
  return (
    <aside className="bg-nudge-light dark:bg-nudge-dark sticky top-0 hidden h-dvh w-60 shrink-0 flex-col overflow-y-auto border-r border-border lg:flex">
      <div className="px-6 pt-6 pb-4">
        <NudgeLogo className="h-7 text-primary" />
      </div>

      <nav aria-label="Navigation principale" className="flex flex-1 flex-col">
        <div className="px-3 pb-4">
          <NavList items={MAIN_ITEMS} path={path} />
        </div>

        {/* Temps gagné à la place du nom du cabinet (choix d'Axel), entre 2 filets comme une section n8n */}
        <div className="border-y border-border px-6 py-5">
          <TimeSaved />
        </div>

        {/* Pastille clair / sombre juste au-dessus des entrées secondaires */}
        <div className="mt-auto flex flex-col gap-4 px-3 py-4">
          <div className="px-3">
            <ThemeToggle />
          </div>
          <NavList items={FOOTER_ITEMS} path={path} />
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

/*
  Barre du haut sur mobile et tablette, à la place de la barre latérale.
  Dessous, les 2 pages principales en onglets (Tableau de bord, Clients), pour y accéder sans menu.
*/
export function MobileTopBar({ path }: { path: string }) {
  const pages = MAIN_ITEMS.filter((item) => item.path)
  return (
    <header className="border-b border-border bg-surface lg:hidden">
      <div className="flex h-14 items-center justify-between px-4">
        <div className="flex items-center gap-3">
          <NudgeLogo variant="mark" className="h-7 text-accent" />
          {/* Temps gagné en version courte (le détail est dans la barre latérale sur grand écran) */}
          <TimeSaved variant="compact" />
        </div>
        <div className="flex items-center gap-3">
          <ThemeToggle compact />
          {/* Sur mobile, l'avatar seul : le nom est lu grâce au texte masqué */}
          <span className="sr-only">{UTILISATEUR_CONNECTE}</span>
          <Avatar size="sm" />
        </div>
      </div>
      <nav aria-label="Navigation principale" className="flex gap-6 px-4">
        {pages.map((item) => {
          const active = item.match?.(path) ?? false
          return (
            <a
              key={item.label}
              href={item.path}
              aria-current={active ? 'page' : undefined}
              onClick={(event) => {
                event.preventDefault()
                navigate(item.path!)
              }}
              className={`-mb-px border-b-2 py-2.5 text-label ${active ? 'border-accent text-primary' : 'border-transparent text-secondary'}`}
            >
              {item.label}
            </a>
          )
        })}
      </nav>
    </header>
  )
}
