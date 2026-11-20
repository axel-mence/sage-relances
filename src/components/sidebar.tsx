import { UTILISATEUR_CONNECTE } from '../api/clients-api'

const NOM_CABINET = 'Cabinet Lemoine'

// Seul le tableau de bord existe en V1 : les autres entrées sont visibles mais inactives (spec, écran 01)
const NAV_ITEMS = [
  { label: 'Tableau de bord', active: true },
  { label: 'Clients', active: false },
  { label: 'Relances', active: false },
  { label: 'Paramètres', active: false },
]

function Logo() {
  return (
    <div className="flex items-center gap-2">
      <span aria-hidden="true" className="grid size-8 place-items-center rounded-md bg-primary text-label text-white">
        L
      </span>
      <span className="text-label text-primary">{NOM_CABINET}</span>
    </div>
  )
}

// Barre latérale fixe sur grand écran (lg et plus)
export function Sidebar() {
  return (
    <aside className="hidden w-60 shrink-0 flex-col justify-between border-r border-border bg-surface p-4 lg:flex">
      <div className="flex flex-col gap-8">
        <Logo />
        <nav aria-label="Navigation principale">
          <ul className="flex flex-col gap-1">
            {NAV_ITEMS.map((item) => (
              <li key={item.label}>
                {item.active ? (
                  <a
                    href="/"
                    aria-current="page"
                    className="flex h-9 items-center rounded-md bg-accent-subtle px-3 text-label text-accent-strong"
                  >
                    {item.label}
                  </a>
                ) : (
                  <span
                    aria-disabled="true"
                    title="Bientôt"
                    className="flex h-9 cursor-not-allowed items-center justify-between rounded-md px-3 text-label text-muted"
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

      <div className="flex flex-col border-t border-border pt-4">
        <span className="text-label text-primary">{UTILISATEUR_CONNECTE}</span>
        <span className="text-caption text-secondary">Associée</span>
      </div>
    </aside>
  )
}

// Barre du haut sur mobile et tablette, à la place de la barre latérale
export function MobileTopBar() {
  return (
    <header className="flex h-14 items-center justify-between border-b border-border bg-surface px-4 lg:hidden">
      <Logo />
      <span className="text-caption text-secondary">{UTILISATEUR_CONNECTE}</span>
    </header>
  )
}
