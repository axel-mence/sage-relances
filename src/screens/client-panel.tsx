import type { ReactNode } from 'react'
import { Button } from '../components/button'
import { Completude } from '../components/completude'
import { SidePanel } from '../components/side-panel'
import { StatusBadge } from '../components/status-badge'
import { WriteEmailLink } from '../components/write-email-link'
import { formatDateHeure, formatEcheance, formatEcheanceRelative, formatJourMois, formatPeriode } from '../domain/format'
import { tauxCompletude } from '../domain/status'
import type { ClientView } from '../domain/types'

type ClientPanelProps = {
  // Client de la liste : le panneau se met à jour tout seul après une relance
  client: ClientView
  now: Date
  pending: boolean
  onRelancer: (client: ClientView) => void
  // « Détail » : ouvre la page client complète (/clients/:slug)
  onDetail: (client: ClientView) => void
  onClose: () => void
  /*
    Zone des toasts. Un panneau ouvert passe devant tout le reste de la page, toasts compris :
    on les affiche donc à l'intérieur du panneau tant qu'il est ouvert.
  */
  toasts: ReactNode
}

const TITLE_ID = 'client-panel-title'

/*
  Écran 03 · Aperçu rapide d'un client en panneau latéral, depuis le tableau de bord (spec, section 7).
  Pour tout l'historique, « Détail » mène à la page client (spec-clients-relances, partie 1).
*/
export function ClientPanel({ client, now, pending, onRelancer, onDetail, onClose, toasts }: ClientPanelProps) {
  return (
    <SidePanel labelledBy={TITLE_ID} onClose={onClose}>
      {(close) => (
        <>
          <PanelContent
            client={client}
            now={now}
            pending={pending}
            onRelancer={onRelancer}
            onDetail={() => {
              // Le panneau se ferme d'abord (le focus est rendu), puis on change de page
              close()
              onDetail(client)
            }}
            onClose={close}
          />
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
  onDetail: () => void
  onClose: () => void
}

function PanelContent({ client, now, pending, onRelancer, onDetail, onClose }: PanelContentProps) {
  // Historique du plus récent au plus ancien
  const relances = [...client.relances].sort((a, b) => b.date.localeCompare(a.date))
  const libelles = Object.fromEntries(client.pieces.map((p) => [p.id, p.libelle]))
  const echeanceEnRouge = client.statut !== 'complet' && formatEcheanceRelative(client.echeance, now).startsWith('dépassée')

  return (
    <>
      {/* En-tête */}
      <header className="flex items-start justify-between gap-4 border-b border-border p-6">
        <div className="flex min-w-0 flex-col gap-1">
          <h2 id={TITLE_ID} className="font-display text-section">{client.nom}</h2>
          <p className="text-caption text-muted">
            {client.collaborateur} · TVA {client.regimeTva}
          </p>
          {/* Contact du client : destinataire des relances */}
          <p className="mt-2 flex min-w-0 items-baseline gap-2 text-body text-secondary">
            <span className="shrink-0 text-primary">{client.contact.nom}</span>
            <span className="truncate select-all">{client.contact.email}</span>
          </p>
          {/* « Lui écrire » (Outlook) et « Détail » (page client complète, avec tout l'historique) */}
          <div className="mt-3 flex flex-wrap gap-2">
            <WriteEmailLink contact={client.contact} />
            <Button variant="secondary" onClick={onDetail}>
              Détail
            </Button>
          </div>
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
            <p className="rounded-sm bg-status-recue-bg px-4 py-3 text-label text-status-recue">Toutes les pièces sont reçues</p>
          )}
          {/*
            Format « Ligne pièce » du DS Nudge v2 : fond surface-2, angles de 8 px, point de 8 px
            orange-rouge si la pièce manque, vert si elle est reçue. L'état est aussi écrit en toutes lettres.
          */}
          <ul className="flex flex-col gap-2">
            {client.pieces.map((piece) => {
              const recue = piece.statut === 'recue'
              return (
                <li key={piece.id} className="flex items-center gap-3 rounded-sm bg-surface-2 px-4 py-3">
                  <span
                    aria-hidden="true"
                    className={`size-2 shrink-0 rounded-full ${recue ? 'bg-status-recue' : 'bg-status-retard'}`}
                  />
                  <span className={`flex-1 text-label ${recue ? 'text-muted' : 'text-primary'}`}>
                    {piece.libelle}
                    <span className="sr-only">{recue ? ' : reçue' : ' : manquante'}</span>
                  </span>
                  <span className={`text-label whitespace-nowrap ${recue ? 'text-muted' : 'text-status-retard'}`}>
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
                  <span aria-hidden="true" className="mt-1.5 size-2 shrink-0 rounded-full bg-accent" />
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
