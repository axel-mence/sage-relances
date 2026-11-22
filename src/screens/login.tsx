import { useState, type FormEvent } from 'react'
import { derniereMethode, IdentifiantsIncorrects, seConnecter, type MethodeConnexion } from '../api/auth-api'
import { AuthLayout } from '../components/auth-layout'
import { AvecBadge, CHAMP, IconeCoche, LienInterne, LogoGoogle, LogoSage, SeparateurOu } from '../components/auth-ui'
import { Button } from '../components/button'
import { navigate } from '../hooks/use-route'

/*
  Écran de connexion (refs-auth/connexion, base Lovable) :
  Sage d'abord, puis Google, séparateur « ou », email + mot de passe.
  Badge « Dernière méthode utilisée » sur la méthode précédente. Tout est simulé (api/auth-api).
*/
export function Login() {
  const [enCours, setEnCours] = useState<MethodeConnexion | null>(null)
  const [erreur, setErreur] = useState<string | null>(null)
  const [aideMotDePasse, setAideMotDePasse] = useState(false)
  const [precedente] = useState(derniereMethode)

  async function connecter(methode: MethodeConnexion, motDePasse?: string) {
    setEnCours(methode)
    setErreur(null)
    try {
      await seConnecter(methode, motDePasse)
      navigate('/')
    } catch (error) {
      setErreur(error instanceof IdentifiantsIncorrects ? error.message : 'Connexion impossible. Réessayez.')
      setEnCours(null)
    }
  }

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const motDePasse = new FormData(event.currentTarget).get('mot-de-passe')
    connecter('email', String(motDePasse ?? ''))
  }

  return (
    <AuthLayout title="Connexion" aside={<CarteRelance />}>
      {/* fieldset désactivé pendant une connexion : tous les champs et boutons sont bloqués d'un coup */}
      <fieldset disabled={enCours !== null} className="flex flex-col gap-6">
        <div className="flex flex-col gap-3">
          <AvecBadge visible={precedente === 'sage'}>
            <Button className="w-full" loading={enCours === 'sage'} onClick={() => connecter('sage')}>
              <LogoSage />
              Se connecter avec Sage
            </Button>
          </AvecBadge>
          <AvecBadge visible={precedente === 'google'}>
            <Button variant="secondary" className="w-full" loading={enCours === 'google'} onClick={() => connecter('google')}>
              <LogoGoogle />
              Continuer avec Google
            </Button>
          </AvecBadge>
        </div>

        <SeparateurOu />

        <form onSubmit={onSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <label htmlFor="email" className="text-label">
              Email
            </label>
            <input id="email" name="email" type="email" required autoComplete="email" placeholder="vous@cabinet.fr" className={CHAMP} />
          </div>

          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <label htmlFor="mot-de-passe" className="text-label">
                Mot de passe
              </label>
              <button
                type="button"
                onClick={() => setAideMotDePasse(true)}
                className="cursor-pointer text-caption text-secondary underline hover:text-primary"
              >
                Mot de passe oublié ?
              </button>
            </div>
            <input
              id="mot-de-passe"
              name="mot-de-passe"
              type="password"
              required
              autoComplete="current-password"
              aria-invalid={erreur !== null || undefined}
              aria-describedby={erreur ? 'erreur-connexion' : undefined}
              className={CHAMP}
            />
            {aideMotDePasse && (
              <p className="text-caption text-secondary">Démo : la réinitialisation du mot de passe n'est pas simulée.</p>
            )}
          </div>

          {erreur && (
            <p id="erreur-connexion" role="alert" className="text-label text-status-retard">
              {erreur}
            </p>
          )}

          <AvecBadge visible={precedente === 'email'}>
            <Button type="submit" variant="secondary" className="w-full" loading={enCours === 'email'}>
              Se connecter
            </Button>
          </AvecBadge>
        </form>
      </fieldset>

      <p className="text-center text-label text-secondary">
        Pas encore de compte ?{' '}
        <LienInterne href="/inscription" className="text-primary underline">
          Créer un compte
        </LienInterne>
      </p>
    </AuthLayout>
  )
}

// Les 3 pièces qui « arrivent » une à une dans l'animation du panneau droit (exemples fictifs)
const PIECES_RECUES = ["Relevé bancaire d'octobre", 'Facture fournisseur', 'Note de frais']

/*
  Panneau droit : ce que fait Nudge, en mouvement.
  Les 3 pièces arrivent l'une après l'autre (animation « piece-recue » dans index.css, boucle de 6 s),
  au-dessus de la carte récapitulative « 3 pièces reçues ce matin ».
  Mouvement réduit : pas d'animation, tout est affiché d'emblée.
*/
function CarteRelance() {
  return (
    <div className="flex w-full max-w-sm flex-col gap-3">
      <ul className="flex flex-col gap-2">
        {PIECES_RECUES.map((piece, index) => (
          <li
            key={piece}
            className="flex animate-[piece-recue_6s_ease-out_infinite_both] items-center justify-between gap-3 rounded-sm border border-border bg-surface px-4 py-3 motion-reduce:animate-none"
            // Décalage de 0,7 s entre 2 pièces : elles arrivent en cascade
            style={{ animationDelay: `${index * 700}ms` }}
          >
            <span className="flex items-center gap-3 text-label text-primary">
              <span aria-hidden="true" className="size-2 rounded-full bg-status-recue" />
              {piece}
            </span>
            <span className="text-caption text-status-recue">Reçue</span>
          </li>
        ))}
      </ul>

      <div className="flex items-center gap-4 rounded-md border border-border bg-surface p-5 shadow-lg">
        <span className="grid size-10 shrink-0 place-items-center rounded-sm bg-status-recue-bg text-status-recue">
          <IconeCoche className="size-5" />
        </span>
        <div className="flex flex-col gap-0.5">
          <span className="text-label text-primary">3 pièces reçues ce matin</span>
          <span className="text-caption text-secondary">Boulangerie Martin · après une relance Nudge</span>
        </div>
      </div>
    </div>
  )
}
