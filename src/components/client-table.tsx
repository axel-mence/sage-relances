import { formatEcheance, formatRelatif, resumePieces } from '../domain/format'
import { tauxCompletude, toDateKey } from '../domain/status'
import type { ClientView } from '../domain/types'
import { Button } from './button'
import { Completude } from './completude'
import { StatusBadge } from './status-badge'

type ClientTableProps = {
  // Clients déjà filtrés et triés par le tableau de bord
  clients: ClientView[]
  now: Date
  onRelancer: (client: ClientView) => void
  // Ouvre la fiche client (panneau latéral)
  onOpen: (client: ClientView) => void
  // Clients dont la relance est en cours d'envoi (bouton en chargement)
  pendingIds: Set<string>
}

type ActionsProps = {
  client: ClientView
  pending: boolean
  onRelancer: (client: ClientView) => void
  onOpen: (client: ClientView) => void
}

// Libellés des pièces manquantes d'un client, pour le résumé
function libellesManquants(client: ClientView) {
  return client.pieces.filter((p) => p.statut === 'manquante').map((p) => p.libelle)
}

// Échéance en rouge si dépassée et dossier incomplet
function Echeance({ client, now }: { client: ClientView; now: Date }) {
  const depassee = client.statut !== 'complet' && client.echeance < toDateKey(now)
  return (
    <span className={depassee ? 'text-status-retard' : 'text-secondary'}>
      {formatEcheance(client.echeance)}
      {depassee && <span className="sr-only"> (dépassée)</span>}
    </span>
  )
}

function PiecesManquantes({ client }: { client: ClientView }) {
  if (client.nbManquantes === 0) return <span className="text-secondary">Aucune</span>
  return (
    // Le survol de la cellule affiche toujours la liste complète des pièces
    <span title={libellesManquants(client).join(', ')} className="flex min-w-0 items-baseline gap-2">
      <span className="text-primary tabular-nums">{client.nbManquantes}</span>
      {/*
        Résumé visible à partir de 1536 px seulement (le nombre suffit en dessous, place prise par le statut).
        Sur mobile (cartes), il est toujours affiché.
        Largeur bornée ici (et pas sur la cellule, que le tableau ignore) pour couper avec « … ».
      */}
      <span className="truncate text-secondary lg:hidden 2xl:inline-block 2xl:max-w-52">
        {resumePieces(libellesManquants(client))}
      </span>
    </span>
  )
}

/*
  Boutons de ligne, toujours visibles :
  « Voir » ouvre la fiche, « Relancer » est inactif si aucune pièce ne manque et en chargement pendant l'envoi.
  stopPropagation : le clic sur la ligne entière ouvre déjà la fiche, on évite de déclencher les deux.
*/
function Actions({ client, pending, onRelancer, onOpen }: ActionsProps) {
  return (
    <span className="flex items-center justify-end gap-2">
      <Button
        size="sm"
        variant="secondary"
        aria-haspopup="dialog"
        aria-label={`Voir la fiche de ${client.nom}`}
        onClick={(event) => {
          event.stopPropagation()
          onOpen(client)
        }}
      >
        Voir
      </Button>
      <Button
        size="sm"
        disabled={client.nbManquantes === 0}
        loading={pending}
        aria-label={`Relancer ${client.nom}`}
        onClick={(event) => {
          event.stopPropagation()
          onRelancer(client)
        }}
      >
        Relancer
      </Button>
    </span>
  )
}

/*
  Table au format Stripe : une seule liste plate, lignes séparées par un filet, survol en surface-2.
  Fond surface, filet et angles de 16 px sur le conteneur (DS Nudge v2).
  Marges du DS à partir de 1280 px (16 px aux bords, 12 px entre colonnes), resserrées entre 1024 et 1280 px.
*/
const CELL = 'px-2 py-3 first:pl-4 last:pr-4 xl:px-2.5 xl:first:pl-6 xl:last:pr-6 2xl:px-3'
// Dates et nombres alignés à droite (chiffres tabulaires hérités du tableau)
const NUM = `${CELL} text-right`

export function ClientTable({ clients, now, onRelancer, onOpen, pendingIds }: ClientTableProps) {
  return (
    <>
      {/* Grand écran : la table */}
      <div className="hidden rounded-md border border-border bg-surface lg:block">
        <table className="w-full text-left whitespace-nowrap">
          {/* Titres de colonnes autorisés sur 2 lignes entre 1024 et 1280 px pour gagner de la place */}
          <thead className="text-caption text-muted lg:whitespace-normal xl:whitespace-nowrap">
            <tr className="border-b border-border">
              <th scope="col" className={`${CELL} font-medium`}>Client</th>
              <th scope="col" className={`${CELL} font-medium`}>Statut</th>
              <th scope="col" className={`${NUM} font-medium`}>Complétude</th>
              <th scope="col" className={`${CELL} hidden font-medium 2xl:table-cell`}>Collaborateur</th>
              <th scope="col" className={`${CELL} font-medium`}>Pièces manquantes</th>
              <th scope="col" className={`${NUM} font-medium`}>Échéance</th>
              <th scope="col" className={`${NUM} hidden font-medium xl:table-cell`}>Dernière relance</th>
              <th scope="col" className={CELL}>
                <span className="sr-only">Actions</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {clients.map((client) => (
              <tr
                key={client.id}
                onClick={() => onOpen(client)}
                className="cursor-pointer border-b border-border transition-colors last:border-b-0 hover:bg-surface-2"
              >
                <th scope="row" className={`${CELL} text-left font-normal`}>
                  {/* Hiérarchie : nom en Libellé (Inter Medium 14), le reste en Corps small gris */}
                  <span className="block text-label text-primary">{client.nom}</span>
                  {/* Collaborateur sous le nom quand la colonne dédiée est masquée */}
                  <span className="block text-caption text-muted 2xl:hidden">{client.collaborateur}</span>
                </th>
                <td className={CELL}><StatusBadge status={client.statut} /></td>
                <td className={NUM}><Completude value={tauxCompletude(client)} /></td>
                <td className={`${CELL} hidden text-secondary 2xl:table-cell`}>{client.collaborateur}</td>
                <td className={CELL}><PiecesManquantes client={client} /></td>
                <td className={NUM}><Echeance client={client} now={now} /></td>
                {/* Masquée entre 1024 et 1280 px faute de place : l'information reste dans la fiche client */}
                <td className={`${NUM} hidden text-muted xl:table-cell`}>{formatRelatif(client.derniereRelance, now)}</td>
                <td className={CELL}>
                  <Actions client={client} pending={pendingIds.has(client.id)} onRelancer={onRelancer} onOpen={onOpen} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile et tablette : une carte par client, dans le même ordre */}
      <ul className="flex flex-col gap-2 lg:hidden">
        {clients.map((client) => (
          <li
            key={client.id}
            onClick={() => onOpen(client)}
            className="flex cursor-pointer flex-col gap-3 rounded-md border border-border bg-surface p-4"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex flex-col">
                <span className="text-label text-primary">{client.nom}</span>
                <span className="text-caption text-muted">{client.collaborateur}</span>
              </div>
              <StatusBadge status={client.statut} />
            </div>
            <div className="flex items-center justify-between gap-3">
              <PiecesManquantes client={client} />
              <Completude value={tauxCompletude(client)} />
            </div>
            <div className="flex flex-wrap items-center justify-between gap-3 text-caption text-muted">
              <span>
                Échéance <Echeance client={client} now={now} /> · Relance : {formatRelatif(client.derniereRelance, now)}
              </span>
              <Actions client={client} pending={pendingIds.has(client.id)} onRelancer={onRelancer} onOpen={onOpen} />
            </div>
          </li>
        ))}
      </ul>
    </>
  )
}
