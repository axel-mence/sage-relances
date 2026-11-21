import { Dashboard } from './screens/dashboard'
import { DsPreview } from './screens/ds-preview'

function App() {
  // TEMPORAIRE (brief Nudge, étape 3) : ?ds affiche la page de test des composants
  if (new URLSearchParams(window.location.search).has('ds')) return <DsPreview />
  return <Dashboard />
}

export default App
