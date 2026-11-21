import { useMemo, useState } from 'react'
import { api } from '../api/clients-api'
import { ClientTable } from '../components/client-table'
import { KpiCard } from '../components/kpi-card'
import { ListEmpty, ListError, ListSkeleton } from '../components/list-states'
import { MobileTopBar, Sidebar } from '../components/sidebar'
import { StatusTabs } from '../components/status-tabs'
import { Toasts } from '../components/toasts'
import { TABS, type StatusFilter } from '../domain/filters'
import { formatDuree, formatJourMois, formatPeriode, prochaineEcheanceTva } from '../domain/format'
import type { ClientView } from '../domain/types'
import { useAsync } from '../hooks/use-async'
import { useNow } from '../hooks/use-now'
import { ClientPanel } from './client-panel'
import { useToasts } from '../hooks/use-toasts'

// Écran 01 · Tableau de bord associé (spec, section 7)
export function Dashboard() {
  const now = useNow()
  const kpis = useAsync(api.getKpis)
  // On charge tous les clients une fois et on filtre ici : les compteurs des onglets restent justes
  const clients = useAsync(api.getClients)
  const [filter, setFilter] = useState<StatusFilter>('en_retard')
  const [pendingIds, setPendingIds] = useState<Set<string>>(new Set())
  // Client affiché dans le panneau latéral (aucun si fermé)
  const [selectedId, setSelectedId] = useState<string>()
  const toasts = useToasts()

  /*
    Relance d'un client (parcours, étape 3) :
    bouton en chargement → appel API → succès : toast, client remplacé (statut « Relancée »), KPI rafraîchis
                                     → échec : toast d'erreur, rien ne change
    Utilisée par le tableau et par le panneau : renvoie le client à jour, ou rien en cas d'échec.
  */
  async function handleRelancer(client: ClientView): Promise<ClientView | undefined> {
    setPendingIds((ids) => new Set(ids).add(client.id))
    try {
      const updated = await api.postRelance(client.id)
      clients.update((list) => list.map((c) => (c.id === updated.id ? updated : c)))
      kpis.reload({ silent: true })
      toasts.show(`Relance envoyée à ${client.nom}`)
      return updated
    } catch {
      toasts.show(`La relance de ${client.nom} n'a pas pu être envoyée. Réessayez.`, 'error')
      return undefined
    } finally {
      setPendingIds((ids) => {
        const next = new Set(ids)
        next.delete(client.id)
        return next
      })
    }
  }

  const counts = useMemo(() => {
    const list = clients.data ?? []
    return Object.fromEntries(
      TABS.map((tab) => [tab.value, tab.value === 'tous' ? list.length : list.filter((c) => c.statut === tab.value).length]),
    ) as Record<StatusFilter, number>
  }, [clients.data])

  const visibleClients = (clients.data ?? []).filter((c) => filter === 'tous' || c.statut === filter)

  // Props communes aux 4 cartes : chargement et erreur (spec, section 8)
  const kpiState = { loading: kpis.loading, unavailable: !!kpis.error }

  // « Réessayer » recharge la liste, et les KPI s'ils étaient aussi en erreur
  function handleRetry() {
    clients.reload()
    if (kpis.error) kpis.reload()
  }

  const toastZone = <Toasts toasts={toasts.toasts} onDismiss={toasts.dismiss} />

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
          <StatusTabs value={filter} counts={clients.data ? counts : undefined} onChange={setFilter} panelId="clients-panel" />
          <div id="clients-panel" role="tabpanel" aria-labelledby={`tab-${filter}`}>
            {/* États de la liste : chargement, erreur, vide, puis contenu (spec, section 8) */}
            {clients.loading ? (
              <ListSkeleton />
            ) : clients.error ? (
              <ListError onRetry={handleRetry} />
            ) : visibleClients.length === 0 ? (
              <ListEmpty onShowAll={filter === 'tous' ? undefined : () => setFilter('tous')} />
            ) : (
              <ClientTable
                clients={visibleClients}
                now={now}
                onRelancer={handleRelancer}
                onOpen={(client) => setSelectedId(client.id)}
                pendingIds={pendingIds}
              />
            )}
          </div>
        </section>
      </main>

      {selectedId && (
        <ClientPanel
          clientId={selectedId}
          now={now}
          pending={pendingIds.has(selectedId)}
          onRelancer={handleRelancer}
          onClose={() => setSelectedId(undefined)}
          toasts={toastZone}
        />
      )}

      {/* Une seule zone de toasts à la fois : dans le panneau s'il est ouvert, sinon ici */}
      {!selectedId && toastZone}
    </div>
  )
}
