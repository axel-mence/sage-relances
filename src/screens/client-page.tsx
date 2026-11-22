import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react'
import { api, ClientIntrouvable } from '../api/clients-api'
import { Button } from '../components/button'
import { ClientNavigator } from '../components/client-navigator'
import { ClientDetails } from '../components/client-details'
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
import { backFromClient, backLabel, navigate } from '../hooks/use-route'

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
  const topBar = <TopBar slug={slug} />

  return (
    /*
      Grand écran : la page fait exactement la hauteur de l'écran et ne défile pas.
      En-tête et colonne de droite restent fixes, seule l'activité défile (demande d'Axel).
    */
    <main className="flex min-w-0 flex-1 flex-col gap-6 px-4 py-6 sm:px-6 lg:h-dvh lg:gap-4 lg:overflow-hidden lg:py-5 xl:gap-5 xl:px-8">
      {client.loading && !client.data ? (
        <>
          {topBar}
          <ClientSkeleton />
        </>
      ) : client.error instanceof ClientIntrouvable ? (
        <>
          {topBar}
          <ClientNotFound />
        </>
      ) : client.error || !client.data ? (
        <>
          {topBar}
          <ClientError onRetry={() => client.reload()} />
        </>
      ) : (
        <ClientContent
          client={client.data}
          now={now}
          pending={relance.pendingIds.has(client.data.id)}
          onRelancer={relance.requestRelance}
          topBar={topBar}
        />
      )}

      {relance.preview}
      {relance.toasts}
    </main>
  )
}

// Barre du haut : retour à gauche, flèches précédent / suivant à droite
function TopBar({ slug }: { slug: string }) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3">
      <a
        href="/clients"
        onClick={(event) => {
          event.preventDefault()
          backFromClient()
        }}
        className="text-label text-secondary hover:text-primary"
      >
        ‹ {backLabel()}
      </a>
      <ClientNavigator slug={slug} />
    </div>
  )
}

type ClientContentProps = {
  client: ClientView
  now: Date
  pending: boolean
  onRelancer: (client: ClientView) => void
  topBar: ReactNode
}

function ClientContent({ client, now, pending, onRelancer, topBar }: ClientContentProps) {
  const titleRef = useRef<HTMLHeadingElement>(null)
  const echeance = formatEcheanceRelative(client.echeance, now)
  const echeanceEnRouge = client.statut !== 'complet' && echeance.startsWith('dépassée')

  // À l'ouverture, le focus va sur le nom du client : les lecteurs d'écran annoncent la nouvelle page
  useEffect(() => {
    titleRef.current?.focus()
  }, [client.id])

  return (
    /*
      Grand écran, grille 2 colonnes × 3 lignes (référence Attio) :
      - à gauche, la barre du haut, l'en-tête puis l'historique (seule zone qui défile) ;
      - à droite, la carte de détails sur toute la hauteur, fixe (320 px, 352 px dès 1280 px).
      Sur mobile, une colonne dans l'ordre de la page : en-tête, détails, historique.
    */
    <div className="flex flex-col gap-6 lg:grid lg:min-h-0 lg:flex-1 lg:grid-cols-[minmax(0,1fr)_20rem] lg:grid-rows-[auto_auto_minmax(0,1fr)] lg:gap-x-6 lg:gap-y-5 xl:grid-cols-[minmax(0,1fr)_22rem] xl:gap-x-8">
      <div className="lg:col-start-1 lg:row-start-1">{topBar}</div>

      {/* En-tête : nom, statut et échéance (les actions sont sous la carte de détails, à droite) */}
      <header className="flex flex-col gap-4 lg:col-start-1 lg:row-start-2">
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
      </header>

      {/*
        Carte de détails fixe, compacte pour tenir entière à l'écran (dès 640 px de haut).
        Sur un écran plus bas encore, elle défile dans son cadre plutôt que d'être coupée.
      */}
      <aside
        aria-label="Détails du client"
        // Alignée sur le nom du client (ligne 2) dès 720 px de haut ; plus bas, elle remonte en haut pour tenir entière
        className="lg:col-start-2 lg:row-span-3 lg:row-start-1 lg:max-h-full lg:self-start lg:overflow-y-auto lg:[@media(min-height:45rem)]:row-span-2 lg:[@media(min-height:45rem)]:row-start-2"
      >
        <div className="flex flex-col gap-4">
          <ClientDetails client={client} now={now} />
          {/* Actions sous la carte du client (demande d'Axel) : « Relancer » prend plus de place */}
          <div className="flex gap-3 *:flex-1 [&>*:last-child]:flex-[2]">
            <WriteEmailLink contact={client.contact} />
            <Button disabled={client.nbManquantes === 0} loading={pending} onClick={() => onRelancer(client)}>
              {client.nbManquantes === 0
                ? 'Rien à relancer'
                : `Relancer (${client.nbManquantes} pièce${client.nbManquantes > 1 ? 's' : ''})`}
            </Button>
          </div>
        </div>
      </aside>

      <section aria-label="Historique" className="lg:col-start-1 lg:row-start-3 lg:min-h-0">
        <Historique client={client} now={now} onRelancer={onRelancer} />
      </section>
    </div>
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
    // Grand écran : les onglets restent en haut, seul le contenu de l'onglet défile
    <div className="flex flex-col gap-6 lg:h-full lg:gap-0">
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
      <TabPanel idPrefix="historique" value={onglet} className="lg:min-h-0 lg:flex-1 lg:overflow-y-auto lg:overscroll-contain lg:pt-6 lg:pr-6">
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

// Chargement : squelette des 2 colonnes (blocs gris qui pulsent), à la place de la fiche
function ClientSkeleton() {
  return (
    <div aria-busy="true" className="flex flex-col gap-6">
      <span className="sr-only">Chargement de la fiche client</span>
      <div aria-hidden="true" className="flex flex-col gap-3">
        <span className="h-9 w-64 animate-pulse rounded-sm bg-surface-2" />
        <span className="h-4 w-48 animate-pulse rounded-sm bg-surface-2" />
      </div>
      <div aria-hidden="true" className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_20rem] xl:grid-cols-[minmax(0,1fr)_22rem] xl:gap-8">
        <div className="flex flex-col gap-4">
          <span className="h-24 animate-pulse rounded-md bg-surface-2" />
          <span className="h-64 animate-pulse rounded-md bg-surface-2" />
        </div>
        <div className="flex flex-col gap-4 lg:order-first">
          <span className="h-10 w-56 animate-pulse rounded-sm bg-surface-2" />
          {[0, 1, 2, 3].map((index) => (
            <span key={index} className="h-12 animate-pulse rounded-sm bg-surface-2" />
          ))}
        </div>
      </div>
    </div>
  )
}

// Erreur réseau : bandeau rouge pâle avec « Réessayer » (testable avec ?fail=1)
function ClientError({ onRetry }: { onRetry: () => void }) {
  return (
    <div
      role="alert"
      className="flex flex-col gap-3 rounded-md border border-status-retard/40 bg-status-retard-bg px-6 py-4 sm:flex-row sm:items-center sm:justify-between"
    >
      <div className="flex flex-col gap-0.5">
        <span className="text-label text-status-retard">Fiche indisponible</span>
        <span className="text-caption text-secondary">Le logiciel comptable ne répond pas. Vos données ne sont pas perdues.</span>
      </div>
      <Button variant="secondary" size="sm" onClick={onRetry} className="self-start sm:self-auto">
        Réessayer
      </Button>
    </div>
  )
}

// Adresse inconnue (lien ancien ou mal copié) : pas une panne, on le dit et on propose l'annuaire
function ClientNotFound() {
  return (
    <div className="flex flex-col items-center gap-4 rounded-md border border-dashed border-border bg-surface px-6 py-12 text-center">
      <h1 className="font-display text-section">Ce client n'existe pas ou plus</h1>
      <p className="text-secondary">Vérifiez l'adresse, ou retrouvez-le dans l'annuaire des clients.</p>
      <Button onClick={() => navigate('/clients')}>Retour aux clients</Button>
    </div>
  )
}
