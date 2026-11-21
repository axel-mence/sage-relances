import { useEffect, useMemo, useRef, useState, type CSSProperties } from 'react'
import { api } from '../api/clients-api'
import { ClientTable } from '../components/client-table'
import { ListEmpty, ListError, ListNoResult, ListSkeleton } from '../components/list-states'
import { SearchField } from '../components/search-field'
import { StatusPills } from '../components/status-pills'
import { TimeSaved } from '../components/time-saved'
import { FILTERS, URGENCE, type StatusFilter } from '../domain/filters'
import { de, formatJourMois, formatPeriode, prochaineEcheanceTva } from '../domain/format'
import { tauxCompletude } from '../domain/status'
import type { ClientView } from '../domain/types'
import { useAsync } from '../hooks/use-async'
import { useElementHeight } from '../hooks/use-element-height'
import { useNow } from '../hooks/use-now'
import { useRelance } from '../hooks/use-relance'
import { navigate } from '../hooks/use-route'

type DashboardProps = {
  // Faux quand une fiche client est ouverte : la liste reste montée mais cachée (état conservé)
  active: boolean
}

// Écran 01 · Liste des clients (spec, section 7)
export function Dashboard({ active }: DashboardProps) {
  const now = useNow()
  const kpis = useAsync(api.getKpis)
  // On charge tous les clients une fois et on filtre ici : les compteurs des pastilles restent justes
  const clients = useAsync(api.getClients)
  const [query, setQuery] = useState('')
  // Filtre de statut (pastilles d'un clic) : « Tous » par défaut
  const [filter, setFilter] = useState<StatusFilter>('tous')
  // Barre de filtres collée en haut (sticky) : sa hauteur sert à coller les titres de colonnes juste dessous
  const [filtersBar, setFiltersBar] = useState<HTMLDivElement | null>(null)
  const filtersHeight = useElementHeight(filtersBar)
  // Relance depuis une ligne : aperçu du mail, puis le client relancé remplace l'ancien dans la liste
  const relance = useRelance({
    now,
    onSent: (updated) => {
      clients.update((list) => list.map((c) => (c.id === updated.id ? updated : c)))
      kpis.reload({ silent: true })
    },
  })

  /*
    Retour sur la liste après une fiche : on rafraîchit sans squelette, pour refléter une relance faite dans la fiche.
    Pas au tout premier affichage de la liste (les données viennent d'être chargées).
    Si l'app s'ouvre directement sur une fiche, la liste est chargée cachée : on rafraîchit alors au premier retour.
  */
  const premierAffichage = useRef(active)
  const reloadClients = clients.reload
  const reloadKpis = kpis.reload
  useEffect(() => {
    if (!active) return
    if (!premierAffichage.current) {
      reloadClients({ silent: true })
      reloadKpis({ silent: true })
    }
    premierAffichage.current = false
  }, [active, reloadClients, reloadKpis])

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
  /*
    Filtre de statut, recherche, puis tri :
    - « Tous » : du plus grave au moins grave (retard, attente, relancé, complet) ;
    - à statut égal, et quand une pastille est choisie : complétude la plus faible en haut (le plus de pièces à récupérer).
    À égalité, l'ordre de l'API (échéance puis pièces) est gardé.
  */
  const visibleClients = (clients.data ?? [])
    .filter(
      (c) =>
        (filter === 'tous' || c.statut === filter) &&
        (!search || normalize(c.nom).includes(search) || normalize(c.collaborateur).includes(search)),
    )
    .sort(
      (a, b) =>
        URGENCE.indexOf(a.statut) - URGENCE.indexOf(b.statut) || tauxCompletude(a) - tauxCompletude(b),
    )


  /*
    Ouvre la fiche client (page dédiée), en lui transmettant l'ordre de la liste affichée :
    il servira aux flèches précédent / suivant (« 2 sur 6 · En retard »).
  */
  function openClient(client: ClientView) {
    navigate(`/clients/${client.slug}`, {
      liste: {
        slugs: visibleClients.map((c) => c.slug),
        libelle: FILTERS.find((f) => f.value === filter)?.label ?? 'Tous',
      },
    })
  }

  // « Réessayer » recharge la liste, et les KPI s'ils étaient aussi en erreur
  function handleRetry() {
    clients.reload()
    if (kpis.error) kpis.reload()
  }

  return (
    <>
      <main className="flex min-w-0 flex-1 flex-col gap-6 px-4 py-6 sm:px-6 lg:py-8 xl:px-8">
        {/* En-tête : titre à gauche, temps gagné mis en avant à droite (en dessous sur mobile) */}
        <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="flex flex-col gap-1">
            <h1 className="font-display text-title">Pièces manquantes</h1>
            <p className="text-secondary">
              Pièces {de(formatPeriode(now))} · Échéance TVA le {formatJourMois(prochaineEcheanceTva(now))}
            </p>
          </div>
          <TimeSaved
            minutes={kpis.data?.tempsGagneMinutes}
            relances={kpis.data?.relancesSemaine}
            loading={kpis.loading}
            error={!!kpis.error}
          />
        </header>

        <section
          aria-label="Liste des clients"
          className="flex flex-col"
          // Hauteur de la barre de filtres, lue par les titres de colonnes collants (voir client-table)
          style={{ '--filters-h': `${filtersHeight}px` } as CSSProperties}
        >
          {/*
            Recherche + pastilles de filtre. Sur grand écran, la barre reste collée en haut pendant le défilement
            (sticky), sur fond de page pour masquer les lignes qui passent dessous.
          */}
          <div
            ref={setFiltersBar}
            className="z-20 flex flex-col gap-3 bg-page pb-4 lg:sticky lg:top-0 lg:flex-row lg:items-center lg:justify-between lg:pt-4"
          >
            <SearchField value={query} onChange={setQuery} />
            {clients.data && <StatusPills counts={counts} value={filter} onChange={setFilter} />}
          </div>

          {/* États de la liste : chargement, erreur, vide, puis table (spec, section 8) */}
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
                onRelancer={relance.requestRelance}
                onOpen={openClient}
                pendingIds={relance.pendingIds}
              />
            )}
          </div>
        </section>
      </main>

      {relance.elements}
    </>
  )
}
