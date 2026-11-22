import { useState } from 'react'
import { aUneHeure, grouperParJour, toDate, type Evenement } from '../domain/activity'
import { de, formatPeriode } from '../domain/format'
import type { ClientView, Relance } from '../domain/types'

type TimelineProps = {
  client: ClientView
  evenements: Evenement[] // déjà triés, du plus récent au plus ancien
  now: Date
}

const heure = new Intl.DateTimeFormat('fr-FR', { hour: '2-digit', minute: '2-digit' })

// Pictos au trait des événements (16 px, couleur du texte)
const PICTOS = {
  // Avion en papier : relance envoyée
  relance: 'M14 2 6.8 9.2M14 2 9.5 14l-2.7-4.8L2 6.5Z',
  // Coche : pièce reçue
  piece_recue: 'M3 8.5 6.5 12 13 4.5',
  // Dossier : ouverture de la période
  ouverture: 'M2 4.5A1.5 1.5 0 0 1 3.5 3h3l1.5 1.5h4.5A1.5 1.5 0 0 1 14 6v5.5a1.5 1.5 0 0 1-1.5 1.5h-9A1.5 1.5 0 0 1 2 11.5Z',
} as const

function Picto({ type }: { type: Evenement['type'] }) {
  return (
    <span aria-hidden="true" className="relative z-10 grid size-7 shrink-0 place-items-center rounded-full border border-border bg-surface-2 text-secondary">
      <svg viewBox="0 0 16 16" className="size-3.5">
        <path d={PICTOS[type]} fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </span>
  )
}

// Phrase de la relance : qui a relancé qui, et pour combien de pièces
function PhraseRelance({ relance, contact }: { relance: Relance; contact: string }) {
  const pieces = `${relance.pieces.length} pièce${relance.pieces.length > 1 ? 's' : ''}`
  if (relance.mode === 'automatique') {
    return (
      <>
        Relance automatique{relance.etape ? ` ${relance.etape}` : ''} envoyée à <strong className="font-medium">{contact}</strong> pour {pieces}
      </>
    )
  }
  return (
    <>
      {relance.par} a relancé <strong className="font-medium">{contact}</strong> pour {pieces}
    </>
  )
}

// Mail réellement envoyé, déplié sous la ligne (référence Shopify « View email »)
function MailEnvoye({ id, relance, client }: { id: string; relance: Relance; client: ClientView }) {
  return (
    <div id={id} className="mt-3 flex flex-col gap-2 rounded-sm border border-border bg-surface p-4">
      <span className="text-caption text-muted">
        À : {client.contact.nom} &lt;{client.contact.email}&gt;
      </span>
      <span className="text-label text-primary">{relance.objet}</span>
      {/* Les retours à la ligne du message sont conservés */}
      <p className="whitespace-pre-line text-body text-secondary">{relance.message}</p>
    </div>
  )
}

// Identifiant stable d'un événement (clé de liste React)
function cleEvenement(evenement: Evenement) {
  if (evenement.type === 'relance') return evenement.relance.id
  if (evenement.type === 'piece_recue') return evenement.piece.id
  return 'ouverture'
}

type LigneProps = {
  evenement: Evenement
  client: ClientView
  dernier: boolean // dernier événement du jour : pas de filet vers le suivant
}

function Ligne({ evenement, client, dernier }: LigneProps) {
  const [mailVisible, setMailVisible] = useState(false)
  const mailId = `mail-${cleEvenement(evenement)}`

  return (
    <li className="relative flex gap-3 pb-5 last:pb-0">
      {/* Filet vertical qui relie les événements du jour */}
      {!dernier && <span aria-hidden="true" className="absolute top-7 bottom-0 left-3.5 w-px bg-border" />}
      <Picto type={evenement.type} />
      <div className="flex min-w-0 flex-1 flex-col pt-1">
        <div className="flex items-baseline justify-between gap-4">
          <p className="text-body text-primary">
            {evenement.type === 'relance' && <PhraseRelance relance={evenement.relance} contact={client.contact.nom} />}
            {evenement.type === 'piece_recue' && <>Pièce reçue : {evenement.piece.libelle}</>}
            {evenement.type === 'ouverture' && (
              <>
                Dossier {de(formatPeriode(toDate(evenement.date)))} ouvert · {evenement.nbPieces} pièces attendues
              </>
            )}
          </p>
          {aUneHeure(evenement) && (
            <time dateTime={evenement.date} className="shrink-0 text-caption text-muted tabular-nums">
              {heure.format(toDate(evenement.date))}
            </time>
          )}
        </div>

        {evenement.type === 'relance' && (
          <>
            <button
              type="button"
              aria-expanded={mailVisible}
              aria-controls={mailId}
              onClick={() => setMailVisible((visible) => !visible)}
              className="mt-2 inline-flex h-8 cursor-pointer items-center self-start rounded-sm border border-border px-3 text-label text-primary transition-colors hover:bg-surface-2"
            >
              {mailVisible ? 'Masquer le mail' : 'Voir le mail'}
            </button>
            {mailVisible && <MailEnvoye id={mailId} relance={evenement.relance} client={client} />}
          </>
        )}
      </div>
    </li>
  )
}

/*
  Historique daté façon Shopify (note d'Axel « top pour historique ») :
  événements groupés par jour (« Aujourd'hui », « Hier », « 18 novembre »), picto à gauche, heure à droite.
*/
export function Timeline({ client, evenements, now }: TimelineProps) {
  return (
    <div className="flex flex-col gap-6">
      {grouperParJour(evenements, now).map((jour) => (
        <section key={jour.cle} aria-label={jour.libelle} className="flex flex-col gap-3">
          <h3 className="text-caption text-muted">{jour.libelle}</h3>
          <ol className="flex flex-col">
            {jour.evenements.map((evenement, index) => (
              <Ligne
                key={cleEvenement(evenement)}
                evenement={evenement}
                client={client}
                dernier={index === jour.evenements.length - 1}
              />
            ))}
          </ol>
        </section>
      ))}
    </div>
  )
}
