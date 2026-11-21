import { Button } from '../components/button'
import { Card } from '../components/card'
import { Completude } from '../components/completude'
import { KeyFigure } from '../components/key-figure'
import { SectionLabel } from '../components/section-label'
import { StatusBadge } from '../components/status-badge'
import { StatusPills } from '../components/status-pills'

/*
  Page de test TEMPORAIRE (étape 3 du brief Nudge) : composants partagés dans le thème Nudge.
  Accessible avec ?ds dans l'adresse. À supprimer une fois les écrans rhabillés (étape 4).
*/
export function DsPreview() {
  return (
    <main className="theme-nudge bg-nudge-dark min-h-screen px-4 py-10 text-mist sm:px-10">
      <div className="mx-auto flex max-w-5xl flex-col gap-10">
        <header className="flex flex-col gap-2">
          <SectionLabel>Nudge · composants partagés</SectionLabel>
          <h1 className="font-display text-[40px] leading-tight font-bold tracking-display">Page de test · étape 3</h1>
          <p className="text-nudge-muted">Rendu des composants dans le thème sombre côté cabinet.</p>
        </header>

        <Card className="flex flex-col gap-6">
          <SectionLabel>Boutons</SectionLabel>
          <div className="flex flex-wrap items-center gap-3">
            <Button>Relancer (3 pièces)</Button>
            <Button loading>Envoi en cours</Button>
            <Button disabled>Rien à relancer</Button>
            <Button variant="secondary">Assigner</Button>
            <Button variant="secondary" size="sm">Voir</Button>
            <Button variant="secondary" size="sm">Relancer</Button>
          </div>
        </Card>

        <Card className="flex flex-col gap-6">
          <SectionLabel>Chips de statut et pastilles</SectionLabel>
          <div className="flex flex-wrap gap-2">
            <StatusBadge status="en_retard" />
            <StatusBadge status="en_attente" />
            <StatusBadge status="relancee" />
            <StatusBadge status="complet" />
          </div>
          <StatusPills counts={{ en_retard: 6, en_attente: 7, relancee: 3, complet: 8 }} onSelect={() => {}} />
          <div className="flex flex-wrap gap-6">
            <Completude value={33} />
            <Completude value={60} />
            <Completude value={100} />
          </div>
        </Card>

        <div className="grid gap-6 md:grid-cols-2">
          <KeyFigure value="6 h 20" label="gagnées cette semaine, à l'échelle du cabinet" />
          <Card tone="light" className="flex flex-col gap-2">
            <span className="text-label font-medium">Carte claire (mist)</span>
            <span className="text-body">Pour la future page de dépôt côté client.</span>
          </Card>
        </div>
      </div>
    </main>
  )
}
