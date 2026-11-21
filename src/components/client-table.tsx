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
        Résumé masqué entre 1024 et 1280 px (le nombre suffit, place prise par la complétude).
        Largeur bornée ici (et pas sur la cellule, que le tableau ignore) pour couper avec « … ».
      */}
      <span className="truncate text-secondary lg:hidden xl:inline-block xl:max-w-36 2xl:max-w-56">
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
  Lignes au format « Ligne client » du DS Nudge v2 : chaque client est une carte (fond surface, filet,
  angles de 16 px, 24 px de marge sur les côtés, 16 px en haut et en bas), séparée de la suivante par 8 px.
  On garde un vrai tableau pour que les colonnes restent alignées d'une ligne à l'autre :
  le fond et le filet sont posés sur chaque cellule, et les angles arrondis sur la première et la dernière.
*/
// Marges du DS (24 px aux bords, 12 px entre colonnes) à partir de 1280 px ; resserrées entre 1024 et 1280 px
const CELL = [
  'border-y border-border bg-surface px-2 py-4 transition-colors group-hover:bg-surface-2 xl:px-3',
  'first:rounded-l-md first:border-l first:pl-4 last:rounded-r-md last:border-r last:pr-4 xl:first:pl-6 xl:last:pr-6',
].join(' ')
// Dates et nombres alignés à droite (chiffres tabulaires hérités du tableau)
const NUM = `${CELL} text-right`
// Titres de colonnes : simple légende au-dessus des cartes, alignée sur leurs marges
const HEAD = 'px-2 pt-1 font-normal first:pl-4 last:pr-4 xl:px-3 xl:first:pl-6 xl:last:pr-6'

// Ligne de titres de colonnes, répétée sous chaque groupe déplié (autorisée sur 2 lignes entre 1024 et 1280 px)
function ColumnHeaders() {
  return (
    <tr className="text-caption text-muted lg:whitespace-normal xl:whitespace-nowrap">
      <th scope="col" className={HEAD}>Client</th>
      <th scope="col" className={`${HEAD} text-right`}>Complétude</th>
      <th scope="col" className={`${HEAD} hidden 2xl:table-cell`}>Collaborateur</th>
      <th scope="col" className={HEAD}>Pièces manquantes</th>
      <th scope="col" className={`${HEAD} text-right`}>Échéance</th>
      <th scope="col" className={`${HEAD} text-right`}>Dernière relance</th>
      <th scope="col" className={HEAD}>
        <span className="sr-only">Actions</span>
      </th>
    </tr>
  )
}

export function ClientTable({ clients, now, searching, openGroups, onToggleGroup, onRelancer, onOpen, pendingIds }: ClientTableProps) {
  // Clients rangés par groupe, dans l'ordre des groupes (le tri de l'API est conservé dans chaque groupe)
  const groups = GROUPS.map((group) => ({ ...group, clients: clients.filter((c) => c.statut === group.status) })).filter(
    (group) => !searching || group.clients.length > 0,
  )
  const isOpen = (status: DossierStatus) => searching || openGroups[status]

  return (
    <>
      {/* Grand écran : un seul tableau, découpé en groupes, pour garder les colonnes alignées */}
      <div className="hidden overflow-x-auto lg:block">
        <table className="w-full border-separate border-spacing-y-2 text-left whitespace-nowrap">
          {groups.map((group) => {
            const open = isOpen(group.status)
            return (
              // Un <tbody> par groupe : en-tête de groupe puis ses lignes
              <tbody key={group.status} id={groupId(group.status)} className="scroll-mt-4">
                <tr>
                  <th colSpan={7} scope="colgroup" className="px-0 pt-4 font-normal">
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

                {/* Titres de colonnes : seulement sous un groupe déplié qui contient des clients */}
                {open && group.clients.length > 0 && <ColumnHeaders />}

                {open && group.clients.length === 0 && (
                  <tr>
                    <td colSpan={7} className="rounded-md border border-dashed border-border px-6 py-4 text-secondary">
                      Aucun client dans ce groupe
                    </td>
                  </tr>
                )}

                {open &&
                  group.clients.map((client) => (
                    <tr key={client.id} onClick={() => onOpen(client)} className="group cursor-pointer">
                      <th scope="row" className={`${CELL} text-left font-normal`}>
                        {/* Hiérarchie : nom en Libellé (Inter Medium 14), le reste en Corps small gris */}
                        <span className="block text-label text-primary">{client.nom}</span>
                        {/* Collaborateur sous le nom quand la colonne dédiée est masquée */}
                        <span className="block text-caption text-muted 2xl:hidden">{client.collaborateur}</span>
                      </th>
                      <td className={NUM}><Completude value={tauxCompletude(client)} /></td>
                      <td className={`${CELL} hidden text-secondary 2xl:table-cell`}>{client.collaborateur}</td>
                      <td className={CELL}><PiecesManquantes client={client} /></td>
                      <td className={NUM}><Echeance client={client} now={now} /></td>
                      <td className={`${NUM} text-muted`}>{formatRelatif(client.derniereRelance, now)}</td>
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
      <div className="flex flex-col gap-6 lg:hidden">
        {groups.map((group) => {
          const open = isOpen(group.status)
          return (
            <section key={group.status} id={`${groupId(group.status)}-mobile`} className="flex scroll-mt-4 flex-col gap-2">
              <StatusGroupHeader
                status={group.status}
                label={group.label}
                count={group.clients.length}
                open={open}
                onToggle={() => onToggleGroup(group.status)}
                controlsId={`${groupId(group.status)}-mobile-liste`}
              />
              {open && (
                <ul id={`${groupId(group.status)}-mobile-liste`} className="flex flex-col gap-2">
                  {group.clients.length === 0 && (
                    <li className="rounded-md border border-dashed border-border px-4 py-3 text-secondary">Aucun client dans ce groupe</li>
                  )}
                  {group.clients.map((client) => (
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
                        <Completude value={tauxCompletude(client)} />
                      </div>
                      <PiecesManquantes client={client} />
                      <div className="flex flex-wrap items-center justify-between gap-3 text-caption text-muted">
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
