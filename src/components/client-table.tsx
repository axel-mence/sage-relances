import { formatEcheance, formatRelatif, resumePieces } from '../domain/format'
import { toDateKey } from '../domain/status'
import type { ClientView } from '../domain/types'
import { Button } from './button'
import { StatusBadge } from './status-badge'

type ClientTableProps = {
  clients: ClientView[]
  now: Date
  onRelancer: (client: ClientView) => void
  // Ouvre la fiche client (panneau latéral)
  onOpen: (client: ClientView) => void
  // Clients dont la relance est en cours d'envoi (bouton en chargement)
  pendingIds: Set<string>
}

type RelancerButtonProps = {
  client: ClientView
  pending: boolean
  onRelancer: (client: ClientView) => void
}

// Libellés des pièces manquantes d'un client, pour le résumé
function libellesManquants(client: ClientView) {
  return client.pieces.filter((p) => p.statut === 'manquante').map((p) => p.libelle)
}

// Échéance en rouge si dépassée et dossier incomplet
function Echeance({ client, now }: { client: ClientView; now: Date }) {
  const depassee = client.statut !== 'complet' && client.echeance < toDateKey(now)
  return (
    <span className={depassee ? 'text-status-retard' : undefined}>
      {formatEcheance(client.echeance)}
      {depassee && <span className="sr-only"> (dépassée)</span>}
    </span>
  )
}

function PiecesManquantes({ client }: { client: ClientView }) {
  if (client.nbManquantes === 0) return <span className="text-secondary">Aucune</span>
  return (
    <span className="flex min-w-0 items-baseline gap-2">
      <span className="text-label">{client.nbManquantes}</span>
      {/* Largeur bornée ici (et pas sur la cellule, que le tableau ignore) pour couper avec « … » */}
      <span
        title={libellesManquants(client).join(', ')}
        className="truncate text-caption text-secondary lg:max-w-20 xl:max-w-48"
      >
        {resumePieces(libellesManquants(client))}
      </span>
    </span>
  )
}

// Bouton « Relancer » : inactif si aucune pièce ne manque, en chargement pendant l'envoi (spec, section 8)
function RelancerButton({ client, pending, onRelancer }: RelancerButtonProps) {
  return (
    <Button
      size="sm"
      variant="secondary"
      disabled={client.nbManquantes === 0}
      loading={pending}
      onClick={(event) => {
        // Ne pas ouvrir la fiche en plus : le clic sur la ligne entière ouvre le panneau
        event.stopPropagation()
        onRelancer(client)
      }}
      aria-label={`Relancer ${client.nom}`}
    >
      Relancer
    </Button>
  )
}

// Nom du client cliquable : c'est lui qui rend la ligne accessible au clavier (Tab puis Entrée)
function OpenButton({ client, onOpen }: { client: ClientView; onOpen: (client: ClientView) => void }) {
  return (
    <button
      type="button"
      onClick={(event) => {
        event.stopPropagation()
        onOpen(client)
      }}
      aria-haspopup="dialog"
      className="cursor-pointer rounded-sm text-left text-label text-primary hover:underline"
    >
      {client.nom}
    </button>
  )
}

export function ClientTable({ clients, now, onRelancer, onOpen, pendingIds }: ClientTableProps) {
  return (
    <>
      {/* Grand écran : vrai tableau */}
      <div className="hidden overflow-x-auto rounded-lg border border-border bg-surface lg:block">
        <table className="w-full text-left whitespace-nowrap">
          <thead className="border-b border-border text-caption text-secondary">
            <tr>
              <th scope="col" className="px-2.5 py-3 xl:px-3 font-medium">Client</th>
              <th scope="col" className="hidden px-2.5 py-3 xl:px-3 font-medium xl:table-cell">Collaborateur</th>
              <th scope="col" className="px-2.5 py-3 xl:px-3 font-medium">Pièces manquantes</th>
              <th scope="col" className="px-2.5 py-3 xl:px-3 font-medium">Échéance</th>
              <th scope="col" className="px-2.5 py-3 xl:px-3 font-medium">Statut</th>
              <th scope="col" className="px-2.5 py-3 xl:px-3 font-medium">Dernière relance</th>
              <th scope="col" className="px-2.5 py-3 xl:px-3 font-medium">
                <span className="sr-only">Action</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {clients.map((client) => (
              <tr
                key={client.id}
                onClick={() => onOpen(client)}
                className="cursor-pointer border-b border-border last:border-b-0 hover:bg-page"
              >
                <th scope="row" className="px-2.5 py-3 xl:px-3 text-left font-normal">
                  <OpenButton client={client} onOpen={onOpen} />
                  {/* Collaborateur sous le nom quand la colonne dédiée est masquée */}
                  <span className="block text-caption text-secondary xl:hidden">{client.collaborateur}</span>
                </th>
                <td className="hidden px-2.5 py-3 xl:px-3 whitespace-nowrap text-secondary xl:table-cell">{client.collaborateur}</td>
                <td className="px-2.5 py-3 xl:px-3"><PiecesManquantes client={client} /></td>
                <td className="px-2.5 py-3 xl:px-3 whitespace-nowrap"><Echeance client={client} now={now} /></td>
                <td className="px-2.5 py-3 xl:px-3"><StatusBadge status={client.statut} /></td>
                <td className="px-2.5 py-3 xl:px-3 whitespace-nowrap text-secondary">{formatRelatif(client.derniereRelance, now)}</td>
                <td className="px-2.5 py-3 xl:px-3 text-right"><RelancerButton client={client} pending={pendingIds.has(client.id)} onRelancer={onRelancer} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile et tablette : une carte par client */}
      <ul className="flex flex-col gap-3 lg:hidden">
        {clients.map((client) => (
          <li
            key={client.id}
            onClick={() => onOpen(client)}
            className="flex cursor-pointer flex-col gap-3 rounded-lg border border-border bg-surface p-4"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex min-w-0 flex-col">
                <OpenButton client={client} onOpen={onOpen} />
                <span className="text-caption text-secondary">{client.collaborateur}</span>
              </div>
              <StatusBadge status={client.statut} />
            </div>
            <PiecesManquantes client={client} />
            <div className="flex items-center justify-between gap-3 text-caption text-secondary">
              <span>
                Échéance <Echeance client={client} now={now} /> · Relance : {formatRelatif(client.derniereRelance, now)}
              </span>
              <RelancerButton client={client} pending={pendingIds.has(client.id)} onRelancer={onRelancer} />
            </div>
          </li>
        ))}
      </ul>
    </>
  )
}
