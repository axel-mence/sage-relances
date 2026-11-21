import { useCallback, useEffect, useRef } from 'react'
import { api } from '../api/clients-api'
import { StatusBadge } from '../components/status-badge'
import { useAsync } from '../hooks/use-async'
import { backToList } from '../hooks/use-route'

type ClientPageProps = {
  slug: string
}

// Écran 03 · Fiche client en page dédiée (spec-clients-relances.md, partie 1)
export function ClientPage({ slug }: ClientPageProps) {
  const request = useCallback(() => api.getClientBySlug(slug), [slug])
  const client = useAsync(request)
  const titleRef = useRef<HTMLHeadingElement>(null)

  // À l'ouverture, le focus va sur le nom du client : les lecteurs d'écran annoncent la nouvelle page
  useEffect(() => {
    if (client.data) titleRef.current?.focus()
  }, [client.data])

  return (
    <main className="flex min-w-0 flex-1 flex-col gap-6 px-4 py-6 sm:px-6 lg:py-8 xl:px-8">
      <a
        href="/"
        onClick={(event) => {
          event.preventDefault()
          backToList()
        }}
        className="self-start text-label text-secondary hover:text-primary"
      >
        ‹ Clients
      </a>

      {client.loading ? (
        <p className="text-secondary">Chargement de la fiche…</p>
      ) : client.error || !client.data ? (
        <p className="text-secondary">Fiche indisponible.</p>
      ) : (
        <header className="flex flex-wrap items-center gap-3">
          <h1 ref={titleRef} tabIndex={-1} className="font-display text-title outline-none">
            {client.data.nom}
          </h1>
          <StatusBadge status={client.data.statut} />
        </header>
      )}

      {/* TEMPORAIRE (étape 2) : le contenu de la fiche arrive aux étapes 3 et 4 */}
      <p className="text-caption text-muted">Fiche en construction : en-tête et détails à l'étape 3, historique à l'étape 4.</p>
    </main>
  )
}
