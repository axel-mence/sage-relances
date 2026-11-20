import { useState } from 'react'
import { api } from '../api/clients-api'
import { KpiCard } from '../components/kpi-card'
import { MobileTopBar, Sidebar } from '../components/sidebar'
import { formatDuree, formatJourMois, formatPeriode, prochaineEcheanceTva } from '../domain/format'
import { useAsync } from '../hooks/use-async'

// Écran 01 · Tableau de bord associé (spec, section 7)
export function Dashboard() {
  // Date figée à l'ouverture de l'écran, pour que l'en-tête ne change pas d'un rendu à l'autre
  const [now] = useState(() => new Date())
  const kpis = useAsync(api.getKpis)

  // Props communes aux 4 cartes : chargement et erreur (spec, section 8)
  const kpiState = { loading: kpis.loading, unavailable: !!kpis.error }

  return (
    <div className="flex min-h-screen flex-col lg:flex-row">
      <MobileTopBar />
      <Sidebar />

      <main className="flex min-w-0 flex-1 flex-col gap-6 px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
        <header className="flex flex-col gap-1">
          <h1 className="text-title">Pièces manquantes</h1>
          <p className="text-secondary">
            Pièces de {formatPeriode(now)} · Échéance TVA le {formatJourMois(prochaineEcheanceTva(now))}
          </p>
        </header>

        <section aria-label="Indicateurs du cabinet" className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <KpiCard
            label="Dossiers complets"
            value={String(kpis.data?.dossiersComplets ?? 0)}
            hint={`sur ${kpis.data?.totalDossiers ?? 180} dossiers`}
            {...kpiState}
          />
          <KpiCard
            label="En retard"
            value={String(kpis.data?.enRetard ?? 0)}
            hint="échéance dépassée"
            tone="danger"
            {...kpiState}
          />
          <KpiCard
            label="Relances cette semaine"
            value={String(kpis.data?.relancesSemaine ?? 0)}
            hint="sur les 7 derniers jours"
            {...kpiState}
          />
          <KpiCard
            label="Temps gagné estimé"
            value={formatDuree(kpis.data?.tempsGagneMinutes ?? 0)}
            hint="cette semaine, à l'échelle du cabinet"
            tone="success"
            {...kpiState}
          />
        </section>
      </main>
    </div>
  )
}
