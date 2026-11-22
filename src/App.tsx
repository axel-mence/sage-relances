import { useEffect, useLayoutEffect, useState } from 'react'
import { KpisProvider } from './components/kpis-provider'
import { Preloader } from './components/preloader'
import { MobileTopBar, Sidebar } from './components/sidebar'
import { clientSlugFromPath, historyState, isClientsPath, navigate, usePath } from './hooks/use-route'
import { useSession } from './hooks/use-session'
import { ClientPage } from './screens/client-page'
import { ClientsDirectory } from './screens/clients-directory'
import { Dashboard } from './screens/dashboard'
import { InviteModal } from './screens/invite-modal'
import { Login } from './screens/login'
import { Settings } from './screens/settings'
import { SageAutoriser, SageChoix, SageImport } from './screens/sage-connect'
import { Signup } from './screens/signup'
import { SignupCabinet } from './screens/signup-cabinet'
import { SignupCode } from './screens/signup-code'

/*
  Coque de l'application : barre latérale (ou barre du haut sur mobile) + page courante.
  - « / » : tableau de bord des pièces manquantes (aperçu d'un client dans le panneau de droite)
  - « /clients » : annuaire des clients
  - « /clients/:slug » : page d'un client (tout son historique)
  - « /parametres » : connecteurs Sage et boîte mail
  pret : faux tant que l'écran de chargement est affiché (la modale d'invitation attend la fin)
*/
function Shell({ pret }: { pret: boolean }) {
  const path = usePath()
  const slug = clientSlugFromPath(path)
  const page = slug ? 'fiche' : isClientsPath(path) ? 'annuaire' : path === '/parametres' ? 'parametres' : 'tableau'

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
      {page === 'parametres' && <Settings />}
      {/* Fin de l'onboarding : invitation des collaborateurs, au premier passage, après l'écran de chargement */}
      {pret && <InviteModal />}
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

// Pages accessibles sans être connecté
const PAGES_PUBLIQUES = ['/connexion', '/inscription']

// Redirection immédiate (remplace l'adresse : le bouton retour ne ramène pas sur la page refusée)
function Rediriger({ vers }: { vers: string }) {
  useEffect(() => {
    navigate(vers, {}, { replace: true })
  }, [vers])
  return null
}

// Page courante, selon l'adresse et la session
function Page({ path, pret }: { path: string; pret: boolean }) {
  const compte = useSession()
  const publique = PAGES_PUBLIQUES.includes(path)

  // Sans compte connecté, tout ramène à la connexion ; déjà connecté, connexion et inscription ramènent au SaaS
  if (!compte && !publique) return <Rediriger vers="/connexion" />
  if (compte && publique) return <Rediriger vers="/" />

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
      <Shell pret={pret} />
    </KpisProvider>
  )
}

/*
  Écran de chargement (preloader) juste après la connexion ou la fin de l'inscription :
  la page de connexion le demande via l'historique ({ preloader: true }), l'app le joue
  par-dessus le SaaS qui se charge dessous, puis retire la demande (un rechargement ne le rejoue pas).
*/
function App() {
  const path = usePath()
  // Lu à chaque rendu (comme l'adresse) : pas de flash du SaaS avant l'écran de chargement
  const preloader = historyState().preloader === true
  // Force un nouveau rendu une fois la demande retirée de l'historique (l'adresse, elle, ne change pas)
  const [, rafraichir] = useState(0)

  if (path === '/test/preloader') return <PreloaderTest />

  return (
    <>
      {/* inert : tant que le preloader est affiché, la page dessous ne reçoit ni clic ni focus clavier */}
      <div className="contents" inert={preloader}>
        <Page path={path} pret={!preloader} />
      </div>
      {preloader && (
        <Preloader
          onDone={() => {
            navigate(window.location.pathname, { ...historyState(), preloader: undefined }, { replace: true })
            rafraichir((n) => n + 1)
          }}
        />
      )}
    </>
  )
}

export default App
