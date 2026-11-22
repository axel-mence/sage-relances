import { useState, type ReactNode } from 'react'
import { de, formatEcheance, formatPeriode, formatRelatif, sansMois } from '../domain/format'
import { derniereRelance, tauxCompletude } from '../domain/status'
import type { ClientView } from '../domain/types'
import { Completude } from './completude'
import { SectionLabel } from './section-label'

/*
  Colonne de droite de la fiche client : sections sobres et empilées (référence Dub, note d'Axel
  « Parfait pour client »), réunies dans une seule carte compacte par ClientDetails.
  Ordre de la spec : dernière relance d'abord (évite les doublons), puis pièces, puis le client.
  Sur grand écran, la colonne est fixe et doit tenir entière à l'écran (demande d'Axel) : marges serrées.
*/

// Section de la carte : titre en label de section du DS, contenu en dessous
function Bloc({ titre, children }: { titre: string; children: ReactNode }) {
  return (
    <section className="flex flex-col gap-2.5 p-4">
      <h2>
        <SectionLabel>{titre}</SectionLabel>
      </h2>
      {children}
    </section>
  )
}

// Ligne « libellé : valeur » des blocs Contact et Entreprise
function Info({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex items-baseline justify-between gap-4">
      <dt className="shrink-0 text-secondary">{label}</dt>
      <dd className="min-w-0 text-right text-primary">{children}</dd>
    </div>
  )
}

const moisAnnee = new Intl.DateTimeFormat('fr-FR', { month: 'long', year: 'numeric' })

function DerniereRelanceBloc({ client, now }: { client: ClientView; now: Date }) {
  const relance = derniereRelance(client)
  return (
    <Bloc titre="Dernière relance">
      {relance ? (
        <p className="text-primary">
          {formatRelatif(relance.date, now)}
          <span className="text-secondary"> · par {relance.par}</span>
        </p>
      ) : (
        <p className="text-secondary">Jamais relancé</p>
      )}
    </Bloc>
  )
}

function PiecesBloc({ client, now }: { client: ClientView; now: Date }) {
  const recues = client.pieces.length - client.nbManquantes
  // Mobile (wireframe 4) : les pièces reçues sont repliées, on montre d'abord ce qui manque
  const [recuesVisibles, setRecuesVisibles] = useState(false)
  // Rien à replier si tout est reçu (on afficherait une liste vide)
  const replie = !recuesVisibles && client.nbManquantes > 0
  return (
    <Bloc titre={`Pièces ${de(formatPeriode(now))}`}>
      <div className="flex flex-col gap-1.5">
        <Completude value={tauxCompletude(client)} size="lg" />
        <span className="text-caption text-secondary tabular-nums">
          {recues} pièce{recues > 1 ? 's' : ''} reçue{recues > 1 ? 's' : ''} sur {client.pieces.length}
        </span>
      </div>
      {client.nbManquantes === 0 && (
        <p className="rounded-sm bg-status-recue-bg px-4 py-3 text-label text-status-recue">Toutes les pièces sont reçues</p>
      )}
      {/*
        Format « Ligne pièce » du DS Nudge v2 : fond surface-2, angles de 8 px, point orange-rouge si la pièce manque,
        vert si elle est reçue (texte grisé). L'état est aussi écrit en toutes lettres.
      */}
      <ul className="flex flex-col gap-1">
        {client.pieces.map((piece) => {
          const recue = piece.statut === 'recue'
          return (
            <li
              key={piece.id}
              className={`items-center gap-3 rounded-sm bg-surface-2 px-3 py-1.5 lg:flex ${recue && replie ? 'hidden' : 'flex'}`}
            >
              <span aria-hidden="true" className={`size-2 shrink-0 rounded-full ${recue ? 'bg-status-recue' : 'bg-status-retard'}`} />
              <span className={`flex-1 text-label ${recue ? 'text-muted' : 'text-primary'}`}>
                {/* Le mois est dans le titre du bloc */}
                {sansMois(piece.libelle)}
                <span className="sr-only">{recue ? ' : reçue' : ' : manquante'}</span>
              </span>
              <span className={`text-caption whitespace-nowrap ${recue ? 'text-muted' : 'text-status-retard'}`}>
                {recue ? (piece.recueLe ? `Reçue le ${formatEcheance(piece.recueLe)}` : 'Reçue') : 'Manquante'}
              </span>
            </li>
          )
        })}
      </ul>
      {recues > 0 && client.nbManquantes > 0 && (
        <button
          type="button"
          aria-expanded={recuesVisibles}
          onClick={() => setRecuesVisibles((visible) => !visible)}
          className="cursor-pointer self-start text-caption text-secondary underline underline-offset-4 hover:text-primary lg:hidden"
        >
          {recuesVisibles ? 'Masquer les pièces reçues' : `+ ${recues} pièce${recues > 1 ? 's' : ''} reçue${recues > 1 ? 's' : ''}`}
        </button>
      )}
    </Bloc>
  )
}

// Contact et entreprise réunis : qui écrire, qui suit le dossier, depuis quand
function ClientBloc({ client }: { client: ClientView }) {
  return (
    <Bloc titre="Client">
      <dl className="flex flex-col gap-1.5">
        <Info label="Contact">{client.contact.nom}</Info>
        <Info label="E-mail">
          {/* Sélectionnable d'un clic pour le copier */}
          <span className="block truncate select-all">{client.contact.email}</span>
        </Info>
        <Info label="Collaborateur">{client.collaborateur}</Info>
        <Info label="TVA">{client.regimeTva === 'mensuelle' ? 'Mensuelle' : 'Trimestrielle'}</Info>
        <Info label="Client depuis">{moisAnnee.format(new Date(`${client.clientDepuis}T00:00:00`))}</Info>
      </dl>
    </Bloc>
  )
}

// Colonne de droite : une seule carte, sections séparées par un filet
export function ClientDetails({ client, now }: { client: ClientView; now: Date }) {
  return (
    <div className="flex flex-col divide-y divide-border rounded-md border border-border bg-surface">
      <DerniereRelanceBloc client={client} now={now} />
      <PiecesBloc client={client} now={now} />
      <ClientBloc client={client} />
    </div>
  )
}
