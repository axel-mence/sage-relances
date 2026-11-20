import { useMemo, useState } from 'react'
import { api } from '../api/clients-api'
import { ClientTable } from '../components/client-table'
import { KpiCard } from '../components/kpi-card'
import { StatusTabs } from '../components/status-tabs'
import { TABS, type StatusFilter } from '../domain/filters'
import { MobileTopBar, Sidebar } from '../components/sidebar'
import { formatDuree, formatJourMois, formatPeriode, prochaineEcheanceTva } from '../domain/format'
import { useAsync } from '../hooks/use-async'

// Écran 01 · Tableau de bord associé (spec, section 7)
export function Dashboard() {
  // Date figée à l'ouverture de l'écran, pour que l'en-tête ne change pas d'un rendu à l'autre
  const [now] = useState(() => new Date())
  const kpis = useAsync(api.getKpis)
  // On charge tous les clients une fois et on filtre ici : les compteurs des onglets restent justes
  const clients = useAsync(api.getClients)
  const [filter, setFilter] = useState<StatusFilter>('en_retard')

  const counts = useMemo(() => {
    const list = clients.data ?? []
    return Object.fromEntries(
      TABS.map((tab) => [tab.value, tab.value === 'tous' ? list.length : list.filter((c) => c.statut === tab.value).length]),
    ) as Record<StatusFilter, number>
  }, [clients.data])

  const visibleClients = (clients.data ?? []).filter((c) => filter === 'tous' || c.statut === filter)

  // Props communes aux 4 cartes : chargement et erreur (spec, section 8)
  const kpiState = { loading: kpis.loading, unavailable: !!kpis.error }

  return (
    <div className="flex min-h-screen flex-col lg:flex-row">
      <MobileTopBar />
      <Sidebar />

      <main className="flex min-w-0 flex-1 flex-col gap-6 px-4 py-6 sm:px-6 lg:py-8 xl:px-8">
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

        <section aria-label="Clients" className="flex flex-col gap-4">
          <StatusTabs value={filter} counts={counts} onChange={setFilter} panelId="clients-panel" />
          <div id="clients-panel" role="tabpanel" aria-labelledby={`tab-${filter}`}>
            {/* États de chargement, vide et erreur détaillés à l'étape 8 */}
            {clients.loading ? (
              <p className="text-secondary">Chargement des dossiers…</p>
            ) : clients.error ? (
              <p className="text-status-retard">Impossible de récupérer les dossiers</p>
            ) : (
              <ClientTable clients={visibleClients} now={now} />
            )}
          </div>
        </section>
      </main>
    </div>
  )
}
