import { useCallback, useEffect, useState, type FormEvent, type ReactNode } from 'react'
import { NOM_CABINET } from '../api/clients-api'
import { Button } from '../components/button'
import { composeRelance } from '../domain/mail'
import { toDateKey } from '../domain/status'
import type { ClientView } from '../domain/types'

type MailPreviewProps = {
  client: ClientView
  now: Date
  // Envoi en cours (bouton en chargement)
  pending: boolean
  // Envoie la relance avec le texte retouché : renvoie true si c'est parti (la fenêtre se ferme), false sinon
  onSend: (mail: { objet: string; message: string }) => Promise<boolean>
  // Appelé une fois la fenêtre fermée (Annuler, ✕, Échap, clic sur le fond ou après l'envoi)
  onClose: () => void
  // Zone de toasts, affichée par-dessus la fenêtre (sinon elle resterait cachée derrière)
  toasts: ReactNode
}

const TITLE_ID = 'mail-preview-title'

const heure = new Intl.DateTimeFormat('fr-FR', { hour: '2-digit', minute: '2-digit' })

/*
  Aperçu du mail de relance, avant l'envoi : le comptable voit ce que son client va recevoir
  et peut retoucher l'objet et le message.
  Fenêtre <dialog> centrée, au-dessus du tableau ou de la fiche client (même principe que le panneau :
  Échap ferme, focus gardé dedans, puis rendu au bouton « Relancer » d'origine).
  Simulation : aucun mail ne part, mais l'API enregistre le texte envoyé (relu ensuite avec « Voir le mail »).
*/
export function MailPreview({ client, now, pending, onSend, onClose, toasts }: MailPreviewProps) {
  const [dialog, setDialog] = useState<HTMLDialogElement | null>(null)
  // Mail rédigé une seule fois à l'ouverture : les retouches du comptable ne sont pas écrasées
  const [mail] = useState(() => composeRelance(client, now, { collaborateur: client.collaborateur, cabinet: NOM_CABINET }))
  const [objet, setObjet] = useState(mail.objet)
  const [message, setMessage] = useState(mail.message)
  // Relance déjà envoyée aujourd'hui : on le signale pour éviter un doublon, sans bloquer (référence Acctual)
  const relanceDuJour =
    client.derniereRelance && toDateKey(new Date(client.derniereRelance)) === toDateKey(now)
      ? heure.format(new Date(client.derniereRelance))
      : undefined

  useEffect(() => {
    if (dialog && !dialog.open) dialog.showModal()
  }, [dialog])

  // Ferme le <dialog> (le navigateur rend le focus au bouton d'origine), puis prévient le parent
  const close = useCallback(() => {
    dialog?.close()
    onClose()
  }, [dialog, onClose])

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    if (await onSend({ objet, message })) close()
  }

  return (
    <dialog
      ref={setDialog}
      aria-labelledby={TITLE_ID}
      onClose={onClose}
      onClick={(event) => event.target === event.currentTarget && close()}
      className="m-auto max-h-[calc(100dvh-2rem)] w-[calc(100%-2rem)] max-w-xl overflow-hidden rounded-md border border-border bg-surface p-0 text-primary backdrop:bg-black/60"
    >
      <form onSubmit={handleSubmit} className="flex max-h-[calc(100dvh-2rem)] flex-col">
        {/* En-tête */}
        <header className="flex items-start justify-between gap-4 border-b border-border px-6 py-5">
          <div className="flex flex-col gap-1">
            <h2 id={TITLE_ID} className="font-display text-section">Aperçu de la relance</h2>
            <p className="text-caption text-muted">{client.nom} · ce que votre client va recevoir</p>
          </div>
          <button
            type="button"
            onClick={close}
            aria-label="Fermer l'aperçu"
            className="grid size-8 shrink-0 cursor-pointer place-items-center rounded-sm text-secondary hover:bg-surface-2 hover:text-primary"
          >
            ✕
          </button>
        </header>

        {/* Champs du mail : destinataire fixe, objet et message modifiables */}
        <div className="flex flex-1 flex-col gap-4 overflow-y-auto px-6 py-5">
          {relanceDuJour && (
            <p role="status" className="rounded-sm bg-status-attente-bg px-3 py-2 text-label text-status-attente">
              Dernière relance aujourd'hui à {relanceDuJour}
            </p>
          )}
          <div className="flex flex-col gap-1.5">
            <span className="text-label text-secondary">À</span>
            <p className="rounded-sm bg-surface-2 px-3 py-2 text-body break-all">{mail.destinataire}</p>
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="mail-objet" className="text-label text-secondary">Objet</label>
            <input
              id="mail-objet"
              value={objet}
              onChange={(event) => setObjet(event.target.value)}
              required
              className="h-10 rounded-sm border border-border bg-surface px-3 text-body text-primary hover:border-secondary focus:border-primary"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="mail-message" className="text-label text-secondary">Message</label>
            <textarea
              id="mail-message"
              value={message}
              onChange={(event) => setMessage(event.target.value)}
              required
              rows={13}
              className="resize-y rounded-sm border border-border bg-surface px-3 py-2 text-body text-primary hover:border-secondary focus:border-primary"
            />
          </div>
        </div>

        {/* Actions */}
        <footer className="flex flex-col-reverse gap-3 border-t border-border px-6 py-4 sm:flex-row sm:justify-end">
          <Button variant="secondary" onClick={close}>
            Annuler
          </Button>
          <Button type="submit" loading={pending}>
            Envoyer la relance
          </Button>
        </footer>
      </form>
      {toasts}
    </dialog>
  )
}
