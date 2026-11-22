import { useLayoutEffect, useState } from 'react'
import { KpisProvider } from './components/kpis-provider'
import { Preloader } from './components/preloader'
import { MobileTopBar, Sidebar } from './components/sidebar'
import { clientSlugFromPath, historyState, isClientsPath, usePath } from './hooks/use-route'
import { ClientPage } from './screens/client-page'
import { ClientsDirectory } from './screens/clients-directory'
import { Dashboard } from './screens/dashboard'
import { InviteModal } from './screens/invite-modal'
import { Login } from './screens/login'
import { SageAutoriser, SageChoix, SageImport } from './screens/sage-connect'
import { Signup } from './screens/signup'
import { SignupCabinet } from './screens/signup-cabinet'
import { SignupCode } from './screens/signup-code'

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
      {/* Fin de l'onboarding : invitation des collaborateurs, au premier passage seulement */}
      <InviteModal />
    </div>
  )
}

/*
  Route de test du preloader (étape 1 de refs-auth : valider le rendu avant de le brancher au lancement).
  À la fin de l'animation, un bouton permet de la rejouer.
*/
function PreloaderTest() {
  const [essai, setEssai] = useState(0)
  const [fini, setFini] = useState(false)

  return (
    <main className="theme-dark grid min-h-screen place-items-center bg-page">
      {fini ? (
        <button
          type="button"
          onClick={() => {
            setFini(false)
            setEssai((n) => n + 1)
          }}
          className="h-10 cursor-pointer rounded-sm bg-accent px-4 text-button text-accent-on hover:bg-accent-hover"
        >
          Rejouer le preloader
        </button>
      ) : (
        <Preloader key={essai} onDone={() => setFini(true)} />
      )}
    </main>
  )
}

// Page courante, sans le preloader
function Page({ path }: { path: string }) {
  // Pages d'auth : plein écran, sans la barre latérale de l'app
  if (path === '/connexion') return <Login />
  if (path === '/inscription') return <Signup />
  if (path === '/inscription/code') return <SignupCode />
  if (path === '/inscription/cabinet') return <SignupCabinet />
  if (path === '/onboarding/sage') return <SageChoix />
  if (path === '/onboarding/sage/autoriser') return <SageAutoriser />
  if (path === '/onboarding/sage/import') return <SageImport />

  return (
    <KpisProvider>
      <Shell />
    </KpisProvider>
  )
}

// Le preloader ne se joue qu'une fois par session (onglet) : pas à chaque rechargement
const CLE_PRELOADER = 'nudge:preloader-vu'

function preloaderDejaVu() {
  try {
    return sessionStorage.getItem(CLE_PRELOADER) === '1'
  } catch {
    return false
  }
}

function App() {
  const path = usePath()
  const [preloaderVu, setPreloaderVu] = useState(preloaderDejaVu)

  if (path === '/test/preloader') return <PreloaderTest />

  return (
    <>
      {/*
        La page se charge sous le preloader : ses données sont prêtes quand il disparaît.
        inert : tant qu'il est affiché, la page cachée ne reçoit ni clic ni focus clavier.
      */}
      <div className="contents" inert={!preloaderVu}>
        <Page path={path} />
      </div>
      {!preloaderVu && (
        <Preloader
          onDone={() => {
            try {
              sessionStorage.setItem(CLE_PRELOADER, '1')
            } catch {
              // Stockage bloqué : le preloader se rejouera au prochain rechargement, sans gravité
            }
            setPreloaderVu(true)
          }}
        />
      )}
    </>
  )
}

export default App
