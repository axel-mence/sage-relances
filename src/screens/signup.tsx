import { useState, type FormEvent } from 'react'
import { CompteExistant, creerCompte, type MethodeConnexion } from '../api/auth-api'
import { AuthLayout } from '../components/auth-layout'
import { CHAMP, IconeCoche, LienInterne, LogoGoogle, LogoSage, SeparateurOu } from '../components/auth-ui'
import { Button } from '../components/button'
import { navigate } from '../hooks/use-route'

// Les 3 arguments du panneau droit (CONTEXTE refs-auth : 3 au maximum)
const ARGUMENTS = ["14 jours d'essai", 'Sans carte bancaire', 'Connecté à Sage en 2 minutes']

/*
  Inscription (refs-auth/inscription, même base que la connexion) :
  SSO d'abord (Sage, Google), puis email + mot de passe.
  - SSO : l'email est déjà vérifié, on passe directement aux infos du cabinet ;
  - email : un code à 6 chiffres est envoyé, à saisir à l'étape suivante.
*/
export function Signup() {
  const [enCours, setEnCours] = useState<MethodeConnexion | null>(null)
  const [erreur, setErreur] = useState<string | null>(null)

  // Le compte est créé (et la session ouverte) dès cette étape ; le code et le cabinet le complètent
  async function inscrire(methode: MethodeConnexion, email?: string, motDePasse?: string) {
    setEnCours(methode)
    setErreur(null)
    try {
      await creerCompte(methode, email, motDePasse)
      if (methode === 'email') navigate('/inscription/code', { email }, { replace: true })
      else navigate('/inscription/cabinet', {}, { replace: true })
    } catch (error) {
      setErreur(error instanceof CompteExistant ? error.message : 'Inscription impossible. Réessayez.')
      setEnCours(null)
    }
  }

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const form = new FormData(event.currentTarget)
    inscrire('email', String(form.get('email') ?? ''), String(form.get('mot-de-passe') ?? ''))
  }

  return (
    <AuthLayout title="Fini les relances à la main." aside={<Arguments />}>
      <fieldset disabled={enCours !== null} className="flex flex-col gap-6">
        <div className="flex flex-col gap-3">
          <Button className="w-full" loading={enCours === 'sage'} onClick={() => inscrire('sage')}>
            <LogoSage />
            S'inscrire avec Sage
          </Button>
          <Button variant="secondary" className="w-full" loading={enCours === 'google'} onClick={() => inscrire('google')}>
            <LogoGoogle />
            Continuer avec Google
          </Button>
        </div>

        <SeparateurOu />

        <form onSubmit={onSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <label htmlFor="email" className="text-label">
              Email professionnel
            </label>
            <input id="email" name="email" type="email" required autoComplete="email" placeholder="vous@cabinet.fr" className={CHAMP} />
          </div>
          <div className="flex flex-col gap-2">
            <label htmlFor="mot-de-passe" className="text-label">
              Mot de passe
            </label>
            <input
              id="mot-de-passe"
              name="mot-de-passe"
              type="password"
              required
              minLength={8}
              autoComplete="new-password"
              aria-describedby="aide-mot-de-passe"
              className={CHAMP}
            />
            <p id="aide-mot-de-passe" className="text-caption text-muted">
              8 caractères minimum.
            </p>
          </div>
          {erreur && (
            <p role="alert" className="text-label text-status-retard">
              {erreur}
            </p>
          )}
          <Button type="submit" variant="secondary" className="w-full" loading={enCours === 'email'}>
            Créer mon compte
          </Button>
        </form>
      </fieldset>

      <p className="text-center text-label text-secondary">
        Déjà un compte ?{' '}
        <LienInterne href="/connexion" className="text-primary underline">
          Se connecter
        </LienInterne>
      </p>
    </AuthLayout>
  )
}

// Panneau droit : une phrase et 3 arguments courts, sans logos ni témoignages
export function Arguments() {
  return (
    <div className="flex w-full max-w-sm flex-col gap-5">
      <p className="font-display text-section text-primary">Nudge relance vos clients à votre place.</p>
      <ul className="flex flex-col gap-3">
        {ARGUMENTS.map((argument) => (
          <li key={argument} className="flex items-center gap-3 text-body text-primary">
            <span className="grid size-6 place-items-center rounded-xs bg-status-recue-bg text-status-recue">
              <IconeCoche />
            </span>
            {argument}
          </li>
        ))}
      </ul>
    </div>
  )
}
