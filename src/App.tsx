import { useLayoutEffect } from 'react'
import { MobileTopBar, Sidebar } from './components/sidebar'
import { clientSlugFromPath, historyState, isClientsPath, usePath } from './hooks/use-route'
import { ClientPage } from './screens/client-page'
import { ClientsDirectory } from './screens/clients-directory'
import { Dashboard } from './screens/dashboard'
import { DsPreview } from './screens/ds-preview'

/*
  Coque de l'application : barre latérale (ou barre du haut sur mobile) + page courante.
  - « / » : tableau de bord des pièces manquantes (aperçu d'un client dans le panneau de droite)
  - « /clients » : annuaire des clients
  - « /clients/:slug » : page d'un client (tout son historique)
*/
function Shell() {
  const path = usePath()
  const slug = clientSlugFromPath(path)
  const page = slug ? 'fiche' : isClientsPath(path) ? 'annuaire' : 'tableau'

  // Fiche : on part du haut. Autres pages : on retrouve la position mémorisée avant de les quitter.
  useLayoutEffect(() => {
    window.scrollTo(0, page === 'fiche' ? 0 : (historyState().scrollY ?? 0))
  }, [page, slug])

  return (
    <div className="flex min-h-screen flex-col lg:flex-row">
      <MobileTopBar path={path} />
      <Sidebar path={path} />
      {/* Tableau de bord et annuaire restent montés (cachés) : filtre, recherche et données sont conservés */}
      <div className={page === 'tableau' ? 'contents' : 'hidden'}>
        <Dashboard active={page === 'tableau'} />
      </div>
      <div className={page === 'annuaire' ? 'contents' : 'hidden'}>
        <ClientsDirectory active={page === 'annuaire'} />
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
