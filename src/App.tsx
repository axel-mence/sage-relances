import { Button } from './components/button'
import { KpiCard } from './components/kpi-card'
import { StatusBadge } from './components/status-badge'

// Page de test temporaire : montre les composants du DS v1. Remplacée par le tableau de bord à l'étape 4.
function App() {
  return (
    <main className="mx-auto flex max-w-5xl flex-col gap-8 px-4 py-8 sm:px-8">
      <header className="flex flex-col gap-1">
        <h1 className="text-title">Composants · DS temporaire v1</h1>
        <p className="text-secondary">Page de test, remplacée par le tableau de bord à l'étape 4.</p>
      </header>

      <section className="flex flex-col gap-3" aria-labelledby="badges">
        <h2 id="badges" className="text-section">Badge statut</h2>
        <div className="flex flex-wrap gap-2">
          <StatusBadge status="en_retard" />
          <StatusBadge status="en_attente" />
          <StatusBadge status="relancee" />
          <StatusBadge status="complet" />
        </div>
      </section>

      <section className="flex flex-col gap-3" aria-labelledby="boutons">
        <h2 id="boutons" className="text-section">Bouton</h2>
        <div className="flex flex-wrap items-center gap-3">
          <Button>Relancer (3 pièces)</Button>
          <Button variant="secondary">Assigner</Button>
          <Button size="sm">Relancer</Button>
          <Button loading>Relance en cours</Button>
          <Button variant="secondary" disabled title="Bientôt">
            Assigner (désactivé)
          </Button>
        </div>
      </section>

      <section className="flex flex-col gap-3" aria-labelledby="kpi">
        <h2 id="kpi" className="text-section">Carte KPI</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <KpiCard label="Dossiers complets" value="60" hint="sur 180 dossiers" />
          <KpiCard label="En retard" value="45" tone="danger" hint="échéance dépassée" />
          <KpiCard label="Relances cette semaine" value="23" />
          <KpiCard label="Temps gagné estimé" value="18 h" tone="success" hint="cette semaine" />
          <KpiCard label="Chargement" loading />
          <KpiCard label="Erreur" unavailable />
        </div>
      </section>
    </main>
  )
}

export default App
