import { useCallback, type ReactNode } from 'react'
import { api } from '../api/clients-api'
import { Button } from '../components/button'
import { SidePanel } from '../components/side-panel'
import { StatusBadge } from '../components/status-badge'
import { Completude } from '../components/completude'
import { tauxCompletude } from '../domain/status'
import { formatDateHeure, formatEcheance, formatEcheanceRelative, formatJourMois, formatPeriode } from '../domain/format'
import type { ClientView } from '../domain/types'
import { useAsync } from '../hooks/use-async'

type ClientPanelProps = {
  clientId: string
  now: Date
  pending: boolean
  // Relance partagée avec le tableau : renvoie le client à jour, ou rien si l'envoi a échoué
  onRelancer: (client: ClientView) => Promise<ClientView | undefined>
  onClose: () => void
  /*
    Zone des toasts. Un panneau ouvert passe devant tout le reste de la page, toasts compris :
    on les affiche donc à l'intérieur du panneau tant qu'il est ouvert.
  */
  toasts: ReactNode
}

const TITLE_ID = 'client-panel-title'

// Écran 03 · Fiche client en panneau latéral (spec, section 7)
export function ClientPanel({ clientId, now, pending, onRelancer, onClose, toasts }: ClientPanelProps) {
  // La requête ne change que si on ouvre un autre client
  const request = useCallback(() => api.getClient(clientId), [clientId])
  const client = useAsync(request)

  async function handleRelancer(current: ClientView) {
    const updated = await onRelancer(current)
    if (updated) client.update(() => updated)
  }

  return (
    <SidePanel labelledBy={TITLE_ID} onClose={onClose}>
      {(close) => (
        <>
          {client.loading && !client.data ? (
            <PanelSkeleton onClose={close} />
          ) : client.error || !client.data ? (
            <PanelError onClose={close} onRetry={() => client.reload()} />
          ) : (
            <PanelContent client={client.data} now={now} pending={pending} onRelancer={handleRelancer} onClose={close} />
          )}
          {toasts}
        </>
      )}
    </SidePanel>
  )
}

function CloseButton({ onClose }: { onClose: () => void }) {
  return (
    <button
      type="button"
      onClick={onClose}
      aria-label="Fermer la fiche client"
      className="grid size-8 shrink-0 cursor-pointer place-items-center rounded-md text-secondary hover:bg-page hover:text-primary"
    >
      ✕
    </button>
  )
}

type PanelContentProps = {
  client: ClientView
  now: Date
  pending: boolean
  onRelancer: (client: ClientView) => void
  onClose: () => void
}

function PanelContent({ client, now, pending, onRelancer, onClose }: PanelContentProps) {
  // Historique du plus récent au plus ancien
  const relances = [...client.relances].sort((a, b) => b.date.localeCompare(a.date))
  const libelles = Object.fromEntries(client.pieces.map((p) => [p.id, p.libelle]))
  const echeanceEnRouge = client.statut !== 'complet' && formatEcheanceRelative(client.echeance, now).startsWith('dépassée')

  return (
    <>
      {/* En-tête */}
      <header className="flex items-start justify-between gap-4 border-b border-border p-6">
        <div className="flex min-w-0 flex-col gap-1">
          <h2 id={TITLE_ID} className="text-section">{client.nom}</h2>
          <p className="text-caption text-secondary">
            {client.collaborateur} · TVA {client.regimeTva}
          </p>
        </div>
        <CloseButton onClose={onClose} />
      </header>

      {/* Contenu défilant */}
      <div className="flex flex-1 flex-col gap-8 overflow-y-auto p-6">
        <div className="flex flex-wrap items-center gap-3">
          <StatusBadge status={client.statut} />
          <span className={`text-label ${echeanceEnRouge ? 'text-status-retard' : 'text-secondary'}`}>
            Échéance le {formatJourMois(new Date(`${client.echeance}T00:00:00`))} · {formatEcheanceRelative(client.echeance, now)}
          </span>
        </div>

        {/* Complétude du dossier : pièces reçues sur pièces attendues */}
        <div className="flex flex-col gap-2">
          <span className="text-caption text-secondary tabular-nums">
            Complétude · {client.pieces.length - client.nbManquantes} pièce
            {client.pieces.length - client.nbManquantes > 1 ? 's' : ''} reçue
            {client.pieces.length - client.nbManquantes > 1 ? 's' : ''} sur {client.pieces.length}
          </span>
          <Completude value={tauxCompletude(client)} size="lg" />
        </div>

        <section aria-labelledby="pieces-title" className="flex flex-col gap-3">
          <h3 id="pieces-title" className="text-label text-primary">
            Pièces attendues · {formatPeriode(now)}
          </h3>
          {client.nbManquantes === 0 && (
            <p className="rounded-md bg-accent-subtle px-3 py-2 text-label text-accent-strong">Toutes les pièces sont reçues</p>
          )}
          <ul className="flex flex-col divide-y divide-border rounded-lg border border-border">
            {client.pieces.map((piece) => {
              const recue = piece.statut === 'recue'
              return (
                <li key={piece.id} className="flex items-center gap-3 px-3 py-2.5">
                  {/* Case visuelle : l'état est aussi donné en texte pour les lecteurs d'écran */}
                  <span
                    aria-hidden="true"
                    className={`grid size-4 shrink-0 place-items-center rounded-sm border text-caption leading-none ${
                      recue ? 'border-accent-strong bg-accent-strong text-white' : 'border-border bg-surface'
                    }`}
                  >
                    {recue && '✓'}
                  </span>
                  <span className={`flex-1 ${recue ? 'text-muted' : 'text-primary'}`}>
                    {piece.libelle}
                    <span className="sr-only">{recue ? ' : reçue' : ' : manquante'}</span>
                  </span>
                  <span className="text-caption text-secondary">
                    {recue ? (piece.recueLe ? `Reçue le ${formatEcheance(piece.recueLe)}` : 'Reçue') : 'Manquante'}
                  </span>
                </li>
              )
            })}
          </ul>
        </section>

        <section aria-labelledby="historique-title" className="flex flex-col gap-3">
          <h3 id="historique-title" className="text-label text-primary">Historique des relances</h3>
          {relances.length === 0 ? (
            <p className="text-secondary">Aucune relance pour l'instant</p>
          ) : (
            // Frise : un point par relance, reliés par un trait vertical
            <ol className="flex flex-col">
              {relances.map((relance, index) => (
                <li key={relance.id} className="relative flex gap-3 pb-5 last:pb-0">
                  {index < relances.length - 1 && (
                    <span aria-hidden="true" className="absolute top-3 bottom-0 left-[3.5px] w-px bg-border" />
                  )}
                  <span aria-hidden="true" className="mt-1.5 size-2 shrink-0 rounded-full bg-primary" />
                  <div className="flex flex-col gap-0.5">
                    <span className="text-label text-primary">
                      Relance par mail · {relance.pieces.length} pièce{relance.pieces.length > 1 ? 's' : ''}
                    </span>
                    <span className="text-caption text-secondary">
                      {formatDateHeure(relance.date)} · {relance.par}
                    </span>
                    <span className="text-caption text-muted">
                      {relance.pieces.map((id) => libelles[id]).filter(Boolean).join(', ')}
                    </span>
                  </div>
                </li>
              ))}
            </ol>
          )}
        </section>
      </div>

      {/* Actions, toujours visibles en bas */}
      <footer className="flex gap-3 border-t border-border p-6">
        <Button
          className="flex-1"
          disabled={client.nbManquantes === 0}
          loading={pending}
          onClick={() => onRelancer(client)}
        >
          {client.nbManquantes === 0
            ? 'Rien à relancer'
            : `Relancer (${client.nbManquantes} pièce${client.nbManquantes > 1 ? 's' : ''})`}
        </Button>
        {/* Hors V1 : visible mais désactivé (spec, section 5) */}
        <Button variant="secondary" disabled title="Bientôt" aria-describedby="assigner-bientot">
          Assigner
        </Button>
        <span id="assigner-bientot" className="sr-only">Bientôt disponible</span>
      </footer>
    </>
  )
}

function PanelSkeleton({ onClose }: { onClose: () => void }) {
  return (
    <div aria-busy="true" className="flex flex-col gap-6 p-6">
      <div className="flex items-start justify-between">
        <h2 id={TITLE_ID} className="sr-only">Chargement de la fiche client</h2>
        <span className="h-6 w-48 animate-pulse rounded-sm bg-page" />
        <CloseButton onClose={onClose} />
      </div>
      <span className="h-5 w-32 animate-pulse rounded-sm bg-page" />
      <span className="h-40 animate-pulse rounded-lg bg-page" />
      <span className="h-24 animate-pulse rounded-lg bg-page" />
    </div>
  )
}

function PanelError({ onClose, onRetry }: { onClose: () => void; onRetry: () => void }) {
  return (
    <div className="flex flex-col gap-4 p-6">
      <div className="flex items-start justify-between gap-4">
        <h2 id={TITLE_ID} className="text-section">Fiche indisponible</h2>
        <CloseButton onClose={onClose} />
      </div>
      <p className="text-secondary">Impossible de récupérer ce dossier pour le moment.</p>
      <Button variant="secondary" onClick={onRetry} className="self-start">
        Réessayer
      </Button>
    </div>
  )
}
