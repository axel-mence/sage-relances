import { useCallback, useEffect, useRef, useState } from 'react'
import { api } from '../api/clients-api'
import { Button } from '../components/button'
import { ContactBloc, DerniereRelanceBloc, EntrepriseBloc, PiecesBloc } from '../components/client-details'
import { StatusBadge } from '../components/status-badge'
import { TabPanel, Tabs } from '../components/tabs'
import { Timeline } from '../components/timeline'
import { WriteEmailLink } from '../components/write-email-link'
import { activiteClient } from '../domain/activity'
import { formatEcheanceRelative, formatJourMois } from '../domain/format'
import type { ClientView } from '../domain/types'
import { useAsync } from '../hooks/use-async'
import { useNow } from '../hooks/use-now'
import { useRelance } from '../hooks/use-relance'
import { backFromClient, backLabel } from '../hooks/use-route'

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
        href="/clients"
        onClick={(event) => {
          event.preventDefault()
          backFromClient()
        }}
        className="self-start text-label text-secondary hover:text-primary"
      >
        ‹ {backLabel()}
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

      {relance.preview}
      {relance.toasts}
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
        {/*
          Grand écran : colonne de droite collée (sticky), seul l'historique défile avec la page.
          Si elle est plus haute que l'écran, elle défile dans son propre cadre pour rester entièrement lisible.
        */}
        <aside
          aria-label="Détails du client"
          className="flex flex-col gap-4 lg:sticky lg:top-6 lg:max-h-[calc(100dvh-3rem)] lg:overflow-y-auto lg:overscroll-contain"
        >
          <DerniereRelanceBloc client={client} now={now} />
          <PiecesBloc client={client} now={now} />
          <ContactBloc client={client} />
          <EntrepriseBloc client={client} />
        </aside>

        <section aria-label="Historique" className="lg:order-first lg:col-span-2">
          <Historique client={client} now={now} onRelancer={onRelancer} />
        </section>
      </div>
    </>
  )
}

type Onglet = 'activite' | 'mails'

type HistoriqueProps = {
  client: ClientView
  now: Date
  onRelancer: (client: ClientView) => void
}

/*
  Colonne de gauche : 2 onglets (référence Attio, note « top »).
  - Activité : tout ce qui s'est passé sur le dossier, groupé par jour (Shopify)
  - Mails envoyés : uniquement les relances, avec « Voir le mail »
*/
function Historique({ client, now, onRelancer }: HistoriqueProps) {
  const [onglet, setOnglet] = useState<Onglet>('activite')
  const activite = activiteClient(client)
  const mails = activite.filter((evenement) => evenement.type === 'relance')
  const evenements = onglet === 'activite' ? activite : mails

  return (
    <div className="flex flex-col gap-6">
      <Tabs
        idPrefix="historique"
        label="Historique du client"
        items={[
          { value: 'activite', label: 'Activité' },
          { value: 'mails', label: 'Mails envoyés', count: mails.length },
        ]}
        value={onglet}
        onChange={setOnglet}
      />
      <TabPanel idPrefix="historique" value={onglet}>
        {evenements.length > 0 ? (
          <Timeline client={client} evenements={evenements} now={now} />
        ) : onglet === 'mails' ? (
          <div className="flex flex-col items-center gap-4 rounded-md border border-dashed border-border px-6 py-10 text-center">
            <p className="text-secondary">Aucun mail envoyé à ce client.</p>
            {client.nbManquantes > 0 && <Button onClick={() => onRelancer(client)}>Relancer</Button>}
          </div>
        ) : (
          <p className="text-secondary">Rien pour l'instant. Les relances et les pièces reçues apparaîtront ici.</p>
        )}
      </TabPanel>
    </div>
  )
}
