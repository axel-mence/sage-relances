import { useCallback, useEffect, useRef } from 'react'
import { api } from '../api/clients-api'
import { Button } from '../components/button'
import { ContactBloc, DerniereRelanceBloc, EntrepriseBloc, PiecesBloc } from '../components/client-details'
import { StatusBadge } from '../components/status-badge'
import { WriteEmailLink } from '../components/write-email-link'
import { formatEcheanceRelative, formatJourMois } from '../domain/format'
import type { ClientView } from '../domain/types'
import { useAsync } from '../hooks/use-async'
import { useNow } from '../hooks/use-now'
import { useRelance } from '../hooks/use-relance'
import { backToList } from '../hooks/use-route'

type ClientPageProps = {
  slug: string
}

// Écran 03 · Fiche client en page dédiée (spec-clients-relances.md, partie 1)
export function ClientPage({ slug }: ClientPageProps) {
  const now = useNow()
  const request = useCallback(() => api.getClientBySlug(slug), [slug])
  const client = useAsync(request)
  // Relance depuis la fiche : aperçu du mail, puis la fiche se met à jour avec le client relancé
  const relance = useRelance({ now, onSent: (updated) => client.update(() => updated) })

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

      {client.loading && !client.data ? (
        <p className="text-secondary">Chargement de la fiche…</p>
      ) : client.error || !client.data ? (
        <p className="text-secondary">Fiche indisponible.</p>
      ) : (
        <ClientContent
          client={client.data}
          now={now}
          pending={relance.pendingIds.has(client.data.id)}
          onRelancer={relance.requestRelance}
        />
      )}

      {relance.elements}
    </main>
  )
}

type ClientContentProps = {
  client: ClientView
  now: Date
  pending: boolean
  onRelancer: (client: ClientView) => void
}

function ClientContent({ client, now, pending, onRelancer }: ClientContentProps) {
  const titleRef = useRef<HTMLHeadingElement>(null)
  const echeance = formatEcheanceRelative(client.echeance, now)
  const echeanceEnRouge = client.statut !== 'complet' && echeance.startsWith('dépassée')

  // À l'ouverture, le focus va sur le nom du client : les lecteurs d'écran annoncent la nouvelle page
  useEffect(() => {
    titleRef.current?.focus()
  }, [client.id])

  return (
    <>
      {/* En-tête : nom, statut et échéance à gauche, actions à droite (référence Attio « Compose Email ») */}
      <header className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div className="flex min-w-0 flex-col gap-2">
          <div className="flex flex-wrap items-center gap-3">
            <h1 ref={titleRef} tabIndex={-1} className="font-display text-title outline-none">
              {client.nom}
            </h1>
            <StatusBadge status={client.statut} />
          </div>
          <p className={`text-label ${echeanceEnRouge ? 'text-status-retard' : 'text-secondary'}`}>
            Échéance le {formatJourMois(new Date(`${client.echeance}T00:00:00`))} · {echeance}
          </p>
        </div>

        {/* Sur mobile, les 2 actions se partagent la largeur, « Relancer » plus large */}
        <div className="flex gap-3 *:flex-1 sm:*:flex-none [&>*:last-child]:flex-[2] sm:[&>*:last-child]:flex-none">
          <WriteEmailLink contact={client.contact} />
          <Button disabled={client.nbManquantes === 0} loading={pending} onClick={() => onRelancer(client)}>
            {client.nbManquantes === 0
              ? 'Rien à relancer'
              : `Relancer (${client.nbManquantes} pièce${client.nbManquantes > 1 ? 's' : ''})`}
          </Button>
        </div>
      </header>

      {/*
        2 colonnes sur grand écran (référence Attio) : historique à gauche (2/3), détails à droite (1/3).
        Les détails viennent en premier dans la page : sur mobile, ils passent avant l'historique.
      */}
      <div className="grid items-start gap-6 lg:grid-cols-3 xl:gap-8">
        <aside aria-label="Détails du client" className="flex flex-col gap-4">
          <DerniereRelanceBloc client={client} now={now} />
          <PiecesBloc client={client} now={now} />
          <ContactBloc client={client} />
          <EntrepriseBloc client={client} />
        </aside>

        <section aria-label="Historique" className="lg:order-first lg:col-span-2">
          {/* TEMPORAIRE (étape 3) : onglets Activité et Mails envoyés à l'étape 4 */}
          <p className="rounded-md border border-dashed border-border p-6 text-caption text-muted">
            Historique (onglets Activité et Mails envoyés) : étape 4.
          </p>
        </section>
      </div>
    </>
  )
}
