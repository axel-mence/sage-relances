import { formatEcheance, formatRelatif, resumePieces } from '../domain/format'
import { toDateKey } from '../domain/status'
import type { ClientView } from '../domain/types'
import { Button } from './button'
import { StatusBadge } from './status-badge'

type ClientTableProps = {
  clients: ClientView[]
  now: Date
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
        className="truncate text-caption text-secondary lg:max-w-24 xl:max-w-56"
      >
        {resumePieces(libellesManquants(client))}
      </span>
    </span>
  )
}

// Bouton « Relancer » : inactif si aucune pièce ne manque (spec, section 8). Branché à l'étape 6.
function RelancerButton({ client }: { client: ClientView }) {
  return (
    <Button size="sm" variant="secondary" disabled={client.nbManquantes === 0} aria-label={`Relancer ${client.nom}`}>
      Relancer
    </Button>
  )
}

export function ClientTable({ clients, now }: ClientTableProps) {
  return (
    <>
      {/* Grand écran : vrai tableau */}
      <div className="hidden overflow-x-auto rounded-lg border border-border bg-surface lg:block">
        <table className="w-full text-left whitespace-nowrap">
          <thead className="border-b border-border text-caption text-secondary">
            <tr>
              <th scope="col" className="px-3 py-3 font-medium">Client</th>
              <th scope="col" className="hidden px-3 py-3 font-medium xl:table-cell">Collaborateur</th>
              <th scope="col" className="px-3 py-3 font-medium">Pièces manquantes</th>
              <th scope="col" className="px-3 py-3 font-medium">Échéance</th>
              <th scope="col" className="px-3 py-3 font-medium">Statut</th>
              <th scope="col" className="px-3 py-3 font-medium">Dernière relance</th>
              <th scope="col" className="px-3 py-3 font-medium">
                <span className="sr-only">Action</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {clients.map((client) => (
              <tr key={client.id} className="border-b border-border last:border-b-0 hover:bg-page">
                <th scope="row" className="px-3 py-3 text-left font-normal">
                  <span className="block text-label text-primary">{client.nom}</span>
                  {/* Collaborateur sous le nom quand la colonne dédiée est masquée */}
                  <span className="block text-caption text-secondary xl:hidden">{client.collaborateur}</span>
                </th>
                <td className="hidden px-3 py-3 whitespace-nowrap text-secondary xl:table-cell">{client.collaborateur}</td>
                <td className="px-3 py-3"><PiecesManquantes client={client} /></td>
                <td className="px-3 py-3 whitespace-nowrap"><Echeance client={client} now={now} /></td>
                <td className="px-3 py-3"><StatusBadge status={client.statut} /></td>
                <td className="px-3 py-3 whitespace-nowrap text-secondary">{formatRelatif(client.derniereRelance, now)}</td>
                <td className="px-3 py-3 text-right"><RelancerButton client={client} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile et tablette : une carte par client */}
      <ul className="flex flex-col gap-3 lg:hidden">
        {clients.map((client) => (
          <li key={client.id} className="flex flex-col gap-3 rounded-lg border border-border bg-surface p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="flex min-w-0 flex-col">
                <span className="text-label text-primary">{client.nom}</span>
                <span className="text-caption text-secondary">{client.collaborateur}</span>
              </div>
              <StatusBadge status={client.statut} />
            </div>
            <PiecesManquantes client={client} />
            <div className="flex items-center justify-between gap-3 text-caption text-secondary">
              <span>
                Échéance <Echeance client={client} now={now} /> · Relance : {formatRelatif(client.derniereRelance, now)}
              </span>
              <RelancerButton client={client} />
            </div>
          </li>
        ))}
      </ul>
    </>
  )
}
