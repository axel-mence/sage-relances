import { useState, type ReactNode } from 'react'
import { api } from '../api/clients-api'
import { Toasts } from '../components/toasts'
import type { MailRelance } from '../domain/mail'
import type { ClientView } from '../domain/types'
import { MailPreview } from '../screens/mail-preview'
import { useKpis } from './kpis-context'
import { useToasts } from './use-toasts'

type UseRelanceOptions = {
  now: Date
  // Appelé avec le client à jour quand une relance est partie (la page met alors ses données à jour)
  onSent: (updated: ClientView) => void
}

type UseRelance = {
  // Ouvre l'aperçu du mail du client
  requestRelance: (client: ClientView) => void
  // Ids des clients dont la relance est en cours d'envoi (boutons en chargement)
  pendingIds: Set<string>
  // Fenêtre d'aperçu (null si fermée), à placer dans la page
  preview: ReactNode
  /*
    Toasts à placer dans la page, ou dans le panneau latéral s'il est ouvert (sinon cachés derrière lui).
    null pendant que l'aperçu est ouvert : il les affiche lui-même, par-dessus sa fenêtre.
  */
  toasts: ReactNode
}

/*
  Parcours de relance, partagé par la liste et la fiche client :
  « Relancer » → aperçu du mail → « Envoyer la relance » → appel API
    → succès : toast, fenêtre fermée, onSent(client à jour), temps gagné rafraîchi
    → échec : toast d'erreur, la fenêtre reste ouverte
*/
export function useRelance({ now, onSent }: UseRelanceOptions): UseRelance {
  const [draft, setDraft] = useState<ClientView>()
  const [pendingIds, setPendingIds] = useState<Set<string>>(new Set())
  const toasts = useToasts()
  const kpis = useKpis()

  async function send(mail: Pick<MailRelance, 'objet' | 'message'>) {
    if (!draft) return false
    const client = draft
    setPendingIds((ids) => new Set(ids).add(client.id))
    try {
      const updated = await api.postRelance(client.id, mail)
      onSent(updated)
      // Le temps gagné (barre latérale) augmente avec chaque relance
      kpis.reload({ silent: true })
      toasts.show(`Relance envoyée à ${client.nom}`)
      return true
    } catch {
      toasts.show(`La relance de ${client.nom} n'a pas pu être envoyée. Réessayez.`, 'error')
      return false
    } finally {
      setPendingIds((ids) => {
        const next = new Set(ids)
        next.delete(client.id)
        return next
      })
    }
  }

  const toastZone = <Toasts toasts={toasts.toasts} onDismiss={toasts.dismiss} />

  return {
    requestRelance: setDraft,
    pendingIds,
    toasts: draft ? null : toastZone,
    preview: draft && (
      <MailPreview
        // Une nouvelle fenêtre (et un nouveau brouillon) par client
        key={draft.id}
        client={draft}
        now={now}
        pending={pendingIds.has(draft.id)}
        onSend={send}
        onClose={() => setDraft(undefined)}
        // Les toasts s'affichent par-dessus la fenêtre tant qu'elle est ouverte
        toasts={toastZone}
      />
    ),
  }
}
