import type { ReactNode } from 'react'
import { NudgeLogo } from './nudge-logo'

type AuthLayoutProps = {
  title: string
  children: ReactNode
  // Contenu du panneau visuel de droite (carte flottante, arguments…)
  aside: ReactNode
}

/*
  Base de toutes les pages d'auth (référence Lovable, note d'Axel : « sobre ») :
  - à gauche, un formulaire étroit centré, beaucoup de blanc ;
  - à droite, un grand panneau en dégradé Nudge (clair ou sombre selon le thème), arrondi, à marge de l'écran.
  Le panneau disparaît sous 900 px : il ne reste que le formulaire.
*/
export function AuthLayout({ title, children, aside }: AuthLayoutProps) {
  return (
    <div className="flex min-h-dvh bg-page">
      <main className="flex flex-1 items-center justify-center px-4 py-12 sm:px-6">
        <div className="flex w-full max-w-sm flex-col gap-8">
          <NudgeLogo className="h-7 text-primary" />
          <h1 className="font-display text-title">{title}</h1>
          {children}
        </div>
      </main>

      <aside
        aria-hidden="true"
        className="m-4 hidden flex-1 items-center justify-center rounded-lg bg-nudge-light p-8 min-[900px]:flex dark:bg-nudge-dark"
      >
        {aside}
      </aside>
    </div>
  )
}
