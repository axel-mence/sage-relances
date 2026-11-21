import { Button } from '../components/button'
import { Card } from '../components/card'
import { Completude } from '../components/completude'
import { KeyFigure } from '../components/key-figure'
import { NudgeLogo } from '../components/nudge-logo'
import { SectionLabel } from '../components/section-label'
import { StatusBadge } from '../components/status-badge'
import { StatusPills } from '../components/status-pills'

/*
  Page de test TEMPORAIRE : composants du DS Nudge v2, en mode sombre (gauche) et clair (droite).
  Accessible avec ?ds dans l'adresse. À supprimer avant le merge de la PR DA.
*/
function Apercu() {
  return (
    <div className="flex flex-col gap-6">
      <NudgeLogo className="h-8 text-primary" />
      <Card className="flex flex-col gap-4">
        <SectionLabel>Boutons</SectionLabel>
        <div className="flex flex-wrap items-center gap-3">
          <Button>Relancer</Button>
          <Button variant="secondary">Assigner</Button>
          <Button size="sm">Relancer</Button>
          <Button size="sm" variant="secondary">Voir</Button>
          <Button loading>Envoi</Button>
        </div>
      </Card>
      <Card className="flex flex-col gap-4">
        <SectionLabel>Statuts</SectionLabel>
        <div className="flex flex-wrap gap-2">
          <StatusBadge status="complet" />
          <StatusBadge status="en_attente" />
          <StatusBadge status="en_retard" />
          <StatusBadge status="relancee" />
        </div>
        <StatusPills counts={{ en_retard: 6, en_attente: 7, relancee: 3, complet: 8 }} onSelect={() => {}} />
        <div className="flex flex-wrap gap-6">
          <Completude value={33} />
          <Completude value={60} />
          <Completude value={100} />
        </div>
      </Card>
      <KeyFigure label="Temps gagné" value="14 h" context="sur les relances" />
    </div>
  )
}

export function DsPreview() {
  return (
    <main className="grid min-h-screen md:grid-cols-2">
      <div className="theme-dark bg-page p-8 text-primary">
        <Apercu />
      </div>
      <div className="theme-light bg-page p-8 text-primary">
        <Apercu />
      </div>
    </main>
  )
}
