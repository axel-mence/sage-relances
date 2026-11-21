import { useMemo, useState } from 'react'
import { api } from '../api/clients-api'
import { ClientTable } from '../components/client-table'
import { ListEmpty, ListError, ListNoResult, ListSkeleton } from '../components/list-states'
import { SearchField } from '../components/search-field'
import { MobileTopBar, Sidebar } from '../components/sidebar'
import { StatusPills } from '../components/status-pills'
import { TimeSaved } from '../components/time-saved'
import { Toasts } from '../components/toasts'
import { FILTERS, URGENCE, type StatusFilter } from '../domain/filters'
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
  // On charge tous les clients une fois et on filtre ici : les compteurs des pastilles restent justes
  const clients = useAsync(api.getClients)
  const [query, setQuery] = useState('')
  // Filtre de statut (pastilles d'un clic) : « Tous » par défaut
  const [filter, setFilter] = useState<StatusFilter>('tous')
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

  // Nombre de clients par filtre (pastilles), calculé sur toute la liste
  const counts = useMemo(() => {
    const list = clients.data ?? []
    return Object.fromEntries(
      FILTERS.map((f) => [f.value, f.value === 'tous' ? list.length : list.filter((c) => c.statut === f.value).length]),
    ) as Record<StatusFilter, number>
  }, [clients.data])

  // Recherche sans tenir compte des majuscules ni des accents (« ines » trouve « Inès »)
  const normalize = (text: string) => text.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase()
  const search = normalize(query.trim())
  // Filtre de statut, recherche, puis tri par urgence (l'ordre de l'API, échéance puis pièces, est gardé à égalité)
  const visibleClients = (clients.data ?? [])
    .filter(
      (c) =>
        (filter === 'tous' || c.statut === filter) &&
        (!search || normalize(c.nom).includes(search) || normalize(c.collaborateur).includes(search)),
    )
    .sort((a, b) => URGENCE.indexOf(a.statut) - URGENCE.indexOf(b.statut))


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
            <h1 className="font-display text-title">Pièces manquantes</h1>
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

        {/* Recherche + pastilles d'état (raccourcis vers les groupes) */}
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <SearchField value={query} onChange={setQuery} />
          {clients.data && <StatusPills counts={counts} value={filter} onChange={setFilter} />}
        </div>

        <section aria-label="Clients par statut" className="flex flex-col gap-4">
          {/* États de la liste : chargement, erreur, vide, puis groupes (spec, section 8) */}
          <div>
            {clients.loading ? (
              <ListSkeleton />
            ) : clients.error ? (
              <ListError onRetry={handleRetry} />
            ) : clients.data?.length === 0 ? (
              <ListEmpty />
            ) : visibleClients.length === 0 ? (
              <ListNoResult
                query={query.trim()}
                onClear={() => {
                  setQuery('')
                  setFilter('tous')
                }}
              />
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
