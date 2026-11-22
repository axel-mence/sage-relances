import { useEffect, useState, type FormEvent } from 'react'
import { compteConnecte, inviterCollaborateurs, marquerInvitationFaite } from '../api/auth-api'
import { Button } from '../components/button'
import { Toasts } from '../components/toasts'
import { historyState, navigate } from '../hooks/use-route'
import { useToasts } from '../hooks/use-toasts'

const TITRE_ID = 'invitation-titre'

type Choix = 'maintenant' | 'plus-tard'

const CHOIX: { value: Choix; label: string }[] = [
  { value: 'maintenant', label: 'Inviter maintenant' },
  { value: 'plus-tard', label: 'Plus tard' },
]

// Sépare la saisie en adresses (virgules, espaces ou retours à la ligne)
function lireEmails(saisie: string) {
  return saisie.split(/[\s,;]+/).filter(Boolean)
}

const EMAIL_VALIDE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

/*
  Fin de l'onboarding, « Étape 3 sur 3 » (référence Mercury, note d'Axel : « rester minimaliste ») :
  une modale par-dessus le tableau de bord flouté, ouverte au premier passage après la connexion Sage.
  Elle se ferme avec « Terminer », « Passer cette étape » ou Échap, et ne revient pas au rechargement.
*/
export function InviteModal() {
  // Ouverte seulement si on arrive de l'onboarding (état transmis par l'historique)
  // et une seule fois par compte (pas à chaque reconnexion qui repasse par la connexion Sage)
  const [ouverte, setOuverte] = useState(() => historyState().invitation === true && !compteConnecte()?.invitationFaite)
  const [dialog, setDialog] = useState<HTMLDialogElement | null>(null)
  const [choix, setChoix] = useState<Choix>('maintenant')
  const [saisie, setSaisie] = useState('')
  const [erreur, setErreur] = useState<string | null>(null)
  const [envoi, setEnvoi] = useState(false)
  const { toasts, show, dismiss } = useToasts()

  useEffect(() => {
    if (dialog && !dialog.open) dialog.showModal()
  }, [dialog])

  // Ferme la modale et retire l'état de l'historique : un rechargement ne la rouvre pas
  function fermer() {
    marquerInvitationFaite()
    dialog?.close()
    setOuverte(false)
    navigate('/', { ...historyState(), invitation: undefined }, { replace: true })
  }

  async function onSubmit(event: FormEvent) {
    event.preventDefault()
    if (choix === 'plus-tard') return fermer()

    const emails = lireEmails(saisie)
    const invalide = emails.find((email) => !EMAIL_VALIDE.test(email))
    if (emails.length === 0) return setErreur('Ajoutez au moins une adresse, ou choisissez « Plus tard ».')
    if (invalide) return setErreur(`Adresse invalide : ${invalide}`)

    setErreur(null)
    setEnvoi(true)
    const total = await inviterCollaborateurs(emails)
    setEnvoi(false)
    fermer()
    show(total > 1 ? `${total} invitations envoyées.` : 'Invitation envoyée.')
  }

  return (
    <>
      {ouverte && (
        <dialog
          ref={setDialog}
          aria-labelledby={TITRE_ID}
          onCancel={(event) => {
            // Échap : même effet que « Passer cette étape »
            event.preventDefault()
            fermer()
          }}
          className="m-auto w-[calc(100%-2rem)] max-w-lg rounded-md border border-border bg-surface p-0 text-primary backdrop:bg-page/60 backdrop:backdrop-blur-sm"
        >
          <form onSubmit={onSubmit} className="flex flex-col gap-6 p-6">
            <div className="flex items-center justify-between gap-4">
              <span className="text-caption text-secondary">Finaliser la configuration · Étape 3 sur 3</span>
              <Button type="submit" size="sm" loading={envoi}>
                Terminer
              </Button>
            </div>

            <div className="flex flex-col gap-1">
              <h2 id={TITRE_ID} className="font-display text-section">
                Invitez vos collaborateurs
              </h2>
              <p className="text-secondary">Chacun suivra ses dossiers et relancera ses clients. Vous pourrez en ajouter plus tard.</p>
            </div>

            <fieldset disabled={envoi} className="flex flex-col gap-3">
              <legend className="sr-only">Quand inviter vos collaborateurs</legend>
              {CHOIX.map((option) => (
                <div
                  key={option.value}
                  className="flex flex-col gap-3 rounded-sm border border-border p-4 has-checked:border-primary"
                >
                  <label className="flex cursor-pointer items-center gap-3 text-body">
                    <input
                      type="radio"
                      name="choix"
                      value={option.value}
                      checked={choix === option.value}
                      onChange={() => {
                        setChoix(option.value)
                        setErreur(null)
                      }}
                      className="accent-current"
                    />
                    {option.label}
                  </label>

                  {/* Le champ des adresses n'apparaît que sous « Inviter maintenant » */}
                  {option.value === 'maintenant' && choix === 'maintenant' && (
                    <div className="flex flex-col gap-2 pl-7">
                      <label htmlFor="emails" className="text-label">
                        Adresses email
                      </label>
                      <textarea
                        id="emails"
                        value={saisie}
                        onChange={(event) => setSaisie(event.target.value)}
                        rows={2}
                        placeholder="paul@cabinet.fr, lea@cabinet.fr"
                        aria-invalid={erreur !== null || undefined}
                        aria-describedby={erreur ? 'erreur-invitation' : 'aide-invitation'}
                        className="w-full resize-none rounded-sm border border-border bg-page px-3 py-2 text-body text-primary placeholder:text-muted hover:border-secondary focus:border-primary aria-invalid:border-status-retard"
                      />
                      {erreur ? (
                        <p id="erreur-invitation" role="alert" className="text-caption text-status-retard">
                          {erreur}
                        </p>
                      ) : (
                        <p id="aide-invitation" className="text-caption text-muted">
                          Séparez les adresses par une virgule.
                        </p>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </fieldset>

            <button
              type="button"
              onClick={fermer}
              disabled={envoi}
              className="cursor-pointer self-center text-label text-secondary hover:text-primary"
            >
              Passer cette étape
            </button>
          </form>
        </dialog>
      )}

      <Toasts toasts={toasts} onDismiss={dismiss} />
    </>
  )
}
