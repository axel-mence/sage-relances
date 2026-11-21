import { useMemo, useState } from 'react'
import { api } from '../api/clients-api'
import { ClientTable } from '../components/client-table'
import { DistributionBar } from '../components/distribution-bar'
import { ListEmpty, ListError, ListSkeleton } from '../components/list-states'
import { MobileTopBar, Sidebar } from '../components/sidebar'
import { StatusTabs } from '../components/status-tabs'
import { TimeSaved } from '../components/time-saved'
import { Toasts } from '../components/toasts'
import { TABS, type StatusFilter } from '../domain/filters'
import { formatJourMois, formatPeriode, prochaineEcheanceTva } from '../domain/format'
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
        {/* En-tête : titre à gauche, temps gagné mis en avant à droite (en dessous sur mobile) */}
        <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="flex flex-col gap-1">
            <h1 className="text-title">Pièces manquantes</h1>
            <p className="text-secondary">
              Pièces de {formatPeriode(now)} · Échéance TVA le {formatJourMois(prochaineEcheanceTva(now))}
            </p>
          </div>
          <TimeSaved
            minutes={kpis.data?.tempsGagneMinutes}
            relances={kpis.data?.relancesSemaine}
            loading={kpis.loading}
            error={!!kpis.error}
          />
        </header>

        {/* Barre de répartition (N2) : un clic sur un segment filtre la liste sur ce statut */}
        {clients.data ? (
          <DistributionBar counts={counts} active={filter} onSelect={setFilter} />
        ) : (
          clients.loading && <span aria-hidden="true" className="h-2 animate-pulse rounded-full bg-border" />
        )}

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
