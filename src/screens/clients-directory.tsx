import { useEffect, useRef, useState } from 'react'
import { api } from '../api/clients-api'
import { Completude } from '../components/completude'
import { ListError, ListNoResult, ListSkeleton } from '../components/list-states'
import { SearchField } from '../components/search-field'
import { StatusBadge } from '../components/status-badge'
import { tauxCompletude } from '../domain/status'
import type { ClientView } from '../domain/types'
import { useAsync } from '../hooks/use-async'
import { navigate } from '../hooks/use-route'

type ClientsDirectoryProps = {
  // Faux quand une autre page est affichée : l'annuaire reste monté mais caché (recherche conservée)
  active: boolean
}

// Recherche sans tenir compte des majuscules ni des accents
const normalize = (text: string) => text.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase()

/*
  Annuaire des clients (entrée « Clients » de la barre latérale), référence Attio (Companies → fiche) :
  tous les clients par ordre alphabétique, une recherche, et un clic ouvre la page du client.
  Le tableau de bord sert à relancer vite ; l'annuaire, à consulter un dossier en profondeur.
*/
export function ClientsDirectory({ active }: ClientsDirectoryProps) {
  const clients = useAsync(api.getClients)
  const [query, setQuery] = useState('')

  // Au retour sur l'annuaire, on rafraîchit sans squelette (une relance a pu être faite dans une fiche)
  const premierAffichage = useRef(active)
  const reload = clients.reload
  useEffect(() => {
    if (!active) return
    if (!premierAffichage.current) reload({ silent: true })
    premierAffichage.current = false
  }, [active, reload])

  const search = normalize(query.trim())
  const visibles = (clients.data ?? [])
    .filter(
      (c) =>
        !search ||
        normalize(c.nom).includes(search) ||
        normalize(c.contact.nom).includes(search) ||
        normalize(c.collaborateur).includes(search),
    )
    .sort((a, b) => a.nom.localeCompare(b.nom, 'fr'))

  function open(client: ClientView) {
    navigate(`/clients/${client.slug}`, {
      depuis: { path: '/clients', libelle: 'Clients' },
      liste: { slugs: visibles.map((c) => c.slug), libelle: 'Clients' },
    })
  }

  return (
    <main className="flex min-w-0 flex-1 flex-col gap-6 px-4 py-6 sm:px-6 lg:py-8 xl:px-8">
      <header className="flex flex-col gap-1">
        <h1 className="font-display text-title">Clients</h1>
        <p className="text-secondary">
          {clients.data ? `${clients.data.length} clients du cabinet` : 'Clients du cabinet'} · ouvrez un client pour voir tout son historique
        </p>
      </header>

      <SearchField id="recherche-annuaire" value={query} onChange={setQuery} />

      {clients.loading ? (
        <ListSkeleton />
      ) : clients.error ? (
        <ListError onRetry={() => clients.reload()} />
      ) : visibles.length === 0 ? (
        <ListNoResult query={query.trim()} onClear={() => setQuery('')} />
      ) : (
        <>
          {/* Grand écran : table simple, même style que la liste du tableau de bord */}
          <div className="hidden rounded-md border border-border bg-surface lg:block">
            <table className="w-full text-left">
              <thead className="text-caption text-muted">
                <tr className="border-b border-border">
                  <th scope="col" className="px-6 py-3 font-medium">Client</th>
                  <th scope="col" className="px-3 py-3 font-medium">Contact</th>
                  <th scope="col" className="px-3 py-3 font-medium">Collaborateur</th>
                  <th scope="col" className="px-3 py-3 font-medium">Statut</th>
                  <th scope="col" className="px-6 py-3 text-right font-medium">Complétude</th>
                </tr>
              </thead>
              <tbody>
                {visibles.map((client) => (
                  <tr
                    key={client.id}
                    onClick={() => open(client)}
                    className="cursor-pointer border-b border-border transition-colors last:border-b-0 hover:bg-surface-2"
                  >
                    <th scope="row" className="px-6 py-3 font-normal">
                      {/* Vrai lien : ouvrable au clavier, et dans un nouvel onglet avec Cmd + clic */}
                      <a
                        href={`/clients/${client.slug}`}
                        onClick={(event) => {
                          if (event.metaKey || event.ctrlKey) return
                          event.preventDefault()
                          event.stopPropagation()
                          open(client)
                        }}
                        className="text-label text-primary hover:underline"
                      >
                        {client.nom}
                      </a>
                    </th>
                    <td className="px-3 py-3">
                      <span className="block text-body text-primary">{client.contact.nom}</span>
                      <span className="block text-caption text-muted">{client.contact.email}</span>
                    </td>
                    <td className="px-3 py-3 text-secondary">{client.collaborateur}</td>
                    <td className="px-3 py-3">
                      <StatusBadge status={client.statut} />
                    </td>
                    <td className="px-6 py-3 text-right">
                      <Completude value={tauxCompletude(client)} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile et tablette : une carte par client */}
          <ul className="flex flex-col gap-2 lg:hidden">
            {visibles.map((client) => (
              <li key={client.id}>
                <a
                  href={`/clients/${client.slug}`}
                  onClick={(event) => {
                    event.preventDefault()
                    open(client)
                  }}
                  className="flex items-start justify-between gap-3 rounded-md border border-border bg-surface p-4"
                >
                  <span className="flex min-w-0 flex-col">
                    <span className="text-label text-primary">{client.nom}</span>
                    <span className="truncate text-caption text-muted">
                      {client.contact.nom} · {client.collaborateur}
                    </span>
                  </span>
                  <StatusBadge status={client.statut} />
                </a>
              </li>
            ))}
          </ul>
        </>
      )}
    </main>
  )
}
