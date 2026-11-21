import { useLayoutEffect } from 'react'
import { MobileTopBar, Sidebar } from './components/sidebar'
import { clientSlugFromPath, historyState, usePath } from './hooks/use-route'
import { ClientPage } from './screens/client-page'
import { Dashboard } from './screens/dashboard'
import { DsPreview } from './screens/ds-preview'

/*
  Coque de l'application : barre latérale (ou barre du haut sur mobile) + page courante.
  - « / » : la liste des clients
  - « /clients/:slug » : la fiche d'un client
*/
function Shell() {
  const path = usePath()
  const slug = clientSlugFromPath(path)

  // Fiche : on part du haut. Liste : on retrouve la position mémorisée avant d'ouvrir la fiche.
  useLayoutEffect(() => {
    window.scrollTo(0, slug ? 0 : (historyState().scrollY ?? 0))
  }, [slug])

  return (
    <div className="flex min-h-screen flex-col lg:flex-row">
      <MobileTopBar />
      <Sidebar />
      {/* La liste reste montée (cachée) pendant qu'une fiche est ouverte : filtre, recherche et données sont conservés */}
      <div className={slug ? 'hidden' : 'contents'}>
        <Dashboard active={!slug} />
      </div>
      {slug && <ClientPage key={slug} slug={slug} />}
    </div>
  )
}

function App() {
  // TEMPORAIRE (brief Nudge, étape 3) : ?ds affiche la page de test des composants
  if (new URLSearchParams(window.location.search).has('ds')) return <DsPreview />
  return <Shell />
}

export default App
