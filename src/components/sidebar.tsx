import { UTILISATEUR_CONNECTE } from '../api/clients-api'
import { Avatar } from './avatar'
import { NudgeLogo } from './nudge-logo'
import { ThemeToggle } from './theme-toggle'

const NOM_CABINET = 'Cabinet Lemoine'

// Seul le tableau de bord existe en V1 : les autres entrées sont visibles mais inactives (spec, écran 01)
const NAV_ITEMS = [
  { label: 'Tableau de bord', active: true },
  { label: 'Clients', active: false },
  { label: 'Relances', active: false },
  { label: 'Paramètres', active: false },
]

/*
  Barre latérale sur grand écran (lg et plus), sur le fond dégradé Nudge du thème actif (clair ou sombre).
  Collée en haut (sticky) et haute d'un écran exactement : elle ne défile jamais avec la page,
  et le bloc utilisateur reste toujours visible en bas.
*/
export function Sidebar() {
  return (
    <aside className="bg-nudge-light dark:bg-nudge-dark sticky top-0 hidden h-dvh w-60 shrink-0 flex-col justify-between overflow-y-auto border-r border-border p-4 lg:flex">
      <div className="flex flex-col gap-8">
        <div className="flex flex-col gap-1 px-3 pt-2">
          <NudgeLogo className="h-7 text-primary" />
          <span className="text-caption text-muted">{NOM_CABINET}</span>
        </div>
        <nav aria-label="Navigation principale">
          <ul className="flex flex-col gap-1">
            {NAV_ITEMS.map((item) => (
              <li key={item.label}>
                {item.active ? (
                  <a
                    href="/"
                    aria-current="page"
                    className="flex h-9 items-center rounded-sm bg-accent-subtle px-3 text-label text-accent"
                  >
                    {item.label}
                  </a>
                ) : (
                  <span
                    aria-disabled="true"
                    title="Bientôt"
                    className="flex h-9 cursor-not-allowed items-center justify-between rounded-sm px-3 text-label text-muted"
                  >
                    {item.label}
                    <span className="text-caption">Bientôt</span>
                  </span>
                )}
              </li>
            ))}
          </ul>
        </nav>
      </div>

      <div className="flex flex-col gap-4 border-t border-border px-3 pt-4">
        <ThemeToggle />
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
