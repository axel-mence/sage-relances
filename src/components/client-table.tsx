import { GROUPS, groupId } from '../domain/filters'
import { formatEcheance, formatRelatif, resumePieces } from '../domain/format'
import { tauxCompletude, toDateKey } from '../domain/status'
import type { ClientView, DossierStatus } from '../domain/types'
import { Button } from './button'
import { Completude } from './completude'
import { StatusGroupHeader } from './status-group'

type ClientTableProps = {
  clients: ClientView[]
  now: Date
  // Recherche en cours : seuls les groupes avec des résultats s'affichent, tous dépliés
  searching: boolean
  // Groupes ouverts (true) ou repliés (false)
  openGroups: Record<DossierStatus, boolean>
  onToggleGroup: (status: DossierStatus) => void
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
    <span className={depassee ? 'text-status-retard' : undefined}>
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
      <span className="text-label">{client.nbManquantes}</span>
      {/*
        Résumé masqué entre 1024 et 1280 px (le nombre suffit, place prise par la complétude).
        Largeur bornée ici (et pas sur la cellule, que le tableau ignore) pour couper avec « … ».
      */}
      <span className="truncate text-caption text-secondary lg:hidden xl:inline-block xl:max-w-40 2xl:max-w-56">
        {resumePieces(libellesManquants(client))}
      </span>
    </span>
  )
}

/*
  Boutons de ligne, toujours visibles (note N1) :
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
        variant="secondary"
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

const CELL = 'px-2.5 py-3 xl:px-3'

export function ClientTable({ clients, now, searching, openGroups, onToggleGroup, onRelancer, onOpen, pendingIds }: ClientTableProps) {
  // Clients rangés par groupe, dans l'ordre des groupes (le tri de l'API est conservé dans chaque groupe)
  const groups = GROUPS.map((group) => ({ ...group, clients: clients.filter((c) => c.statut === group.status) })).filter(
    (group) => !searching || group.clients.length > 0,
  )
  const isOpen = (status: DossierStatus) => searching || openGroups[status]

  return (
    <>
      {/* Grand écran : un seul tableau, découpé en groupes, pour garder les colonnes alignées */}
      <div className="hidden overflow-x-auto rounded-lg border border-border bg-surface lg:block">
        <table className="w-full text-left whitespace-nowrap">
          {/* Titres de colonnes autorisés sur 2 lignes entre 1024 et 1280 px pour gagner de la place */}
          <thead className="border-b border-border text-caption text-secondary lg:whitespace-normal xl:whitespace-nowrap">
            <tr>
              <th scope="col" className={`${CELL} font-medium`}>Client</th>
              <th scope="col" className={`${CELL} font-medium`}>Complétude</th>
              <th scope="col" className={`${CELL} hidden font-medium 2xl:table-cell`}>Collaborateur</th>
              <th scope="col" className={`${CELL} font-medium`}>Pièces manquantes</th>
              <th scope="col" className={`${CELL} font-medium`}>Échéance</th>
              <th scope="col" className={`${CELL} font-medium`}>Dernière relance</th>
              <th scope="col" className={`${CELL} font-medium`}>
                <span className="sr-only">Actions</span>
              </th>
            </tr>
          </thead>

          {groups.map((group) => {
            const open = isOpen(group.status)
            return (
              // Un <tbody> par groupe : en-tête de groupe puis ses lignes
              <tbody key={group.status} id={groupId(group.status)} className="scroll-mt-4">
                <tr className="border-b border-border">
                  <th colSpan={7} scope="colgroup" className="p-0 font-normal">
                    <StatusGroupHeader
                      status={group.status}
                      label={group.label}
                      count={group.clients.length}
                      open={open}
                      onToggle={() => onToggleGroup(group.status)}
                      controlsId={groupId(group.status)}
                    />
                  </th>
                </tr>

                {open && group.clients.length === 0 && (
                  <tr className="border-b border-border">
                    <td colSpan={7} className="px-4 py-3 text-secondary">Aucun client dans ce groupe</td>
                  </tr>
                )}

                {open &&
                  group.clients.map((client) => (
                    <tr
                      key={client.id}
                      onClick={() => onOpen(client)}
                      className="cursor-pointer border-b border-border hover:bg-page"
                    >
                      <th scope="row" className={`${CELL} text-left font-normal`}>
                        <span className="block text-label text-primary">{client.nom}</span>
                        {/* Collaborateur sous le nom quand la colonne dédiée est masquée */}
                        <span className="block text-caption text-secondary 2xl:hidden">{client.collaborateur}</span>
                      </th>
                      <td className={CELL}><Completude value={tauxCompletude(client)} /></td>
                      <td className={`${CELL} hidden text-secondary 2xl:table-cell`}>{client.collaborateur}</td>
                      <td className={CELL}><PiecesManquantes client={client} /></td>
                      <td className={CELL}><Echeance client={client} now={now} /></td>
                      <td className={`${CELL} text-secondary`}>{formatRelatif(client.derniereRelance, now)}</td>
                      <td className={CELL}>
                        <Actions client={client} pending={pendingIds.has(client.id)} onRelancer={onRelancer} onOpen={onOpen} />
                      </td>
                    </tr>
                  ))}
              </tbody>
            )
          })}
        </table>
      </div>

      {/* Mobile et tablette : les mêmes groupes, avec une carte par client */}
      <div className="flex flex-col gap-4 lg:hidden">
        {groups.map((group) => {
          const open = isOpen(group.status)
          return (
            <section key={group.status} id={`${groupId(group.status)}-mobile`} className="scroll-mt-4 overflow-hidden rounded-lg border border-border bg-surface">
              <StatusGroupHeader
                status={group.status}
                label={group.label}
                count={group.clients.length}
                open={open}
                onToggle={() => onToggleGroup(group.status)}
                controlsId={`${groupId(group.status)}-mobile-liste`}
              />
              {open && (
                <ul id={`${groupId(group.status)}-mobile-liste`} className="flex flex-col divide-y divide-border">
                  {group.clients.length === 0 && <li className="px-4 py-3 text-secondary">Aucun client dans ce groupe</li>}
                  {group.clients.map((client) => (
                    <li key={client.id} onClick={() => onOpen(client)} className="flex cursor-pointer flex-col gap-3 p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex flex-col">
                          <span className="text-label text-primary">{client.nom}</span>
                          <span className="text-caption text-secondary">{client.collaborateur}</span>
                        </div>
                        <Completude value={tauxCompletude(client)} />
                      </div>
                      <PiecesManquantes client={client} />
                      <div className="flex flex-wrap items-center justify-between gap-3 text-caption text-secondary">
                        <span>
                          Échéance <Echeance client={client} now={now} /> · Relance : {formatRelatif(client.derniereRelance, now)}
                        </span>
                        <Actions client={client} pending={pendingIds.has(client.id)} onRelancer={onRelancer} onOpen={onOpen} />
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          )
        })}
      </div>
    </>
  )
}
