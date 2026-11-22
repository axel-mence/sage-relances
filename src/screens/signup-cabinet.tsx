import { useState, type FormEvent } from 'react'
import { enregistrerCabinet, type Cabinet } from '../api/auth-api'
import { AuthLayout } from '../components/auth-layout'
import { CHAMP } from '../components/auth-ui'
import { Button } from '../components/button'
import { navigate } from '../hooks/use-route'
import { Arguments } from './signup'

const TAILLES = ['Moins de 50', '50 à 200', '200 à 500', 'Plus de 500']

const ROLES: { value: Cabinet['role']; label: string }[] = [
  { value: 'associe', label: 'Associé' },
  { value: 'collaborateur', label: 'Collaborateur' },
]

/*
  Étape 3 de l'inscription : « Votre cabinet » (nom, nombre de dossiers clients, rôle).
  Ensuite : connexion du logiciel comptable Sage (écran de choix du logiciel).
*/
export function SignupCabinet() {
  const [enCours, setEnCours] = useState(false)

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const form = new FormData(event.currentTarget)
    setEnCours(true)
    await enregistrerCabinet({
      nom: String(form.get('nom') ?? ''),
      dossiers: String(form.get('dossiers') ?? ''),
      role: form.get('role') as Cabinet['role'],
    })
    navigate('/onboarding/sage')
  }

  return (
    <AuthLayout title="Votre cabinet" aside={<Arguments />}>
      <p className="-mt-4 text-secondary">Trois informations pour préparer vos relances.</p>

      <form onSubmit={onSubmit}>
        <fieldset disabled={enCours} className="flex flex-col gap-5">
          <div className="flex flex-col gap-2">
            <label htmlFor="nom" className="text-label">
              Nom du cabinet
            </label>
            <input id="nom" name="nom" required autoComplete="organization" className={CHAMP} />
          </div>

          <div className="flex flex-col gap-2">
            <label htmlFor="dossiers" className="text-label">
              Nombre de dossiers clients
            </label>
            <select id="dossiers" name="dossiers" required defaultValue="" className={`${CHAMP} cursor-pointer`}>
              <option value="" disabled>
                Choisir
              </option>
              {TAILLES.map((taille) => (
                <option key={taille}>{taille}</option>
              ))}
            </select>
          </div>

          <fieldset className="flex flex-col gap-2">
            <legend className="mb-2 text-label">Votre rôle</legend>
            <div className="grid grid-cols-2 gap-3">
              {ROLES.map((role, index) => (
                // Carte radio : toute la carte est cliquable, l'accent encadre le choix
                <label
                  key={role.value}
                  className="flex h-11 cursor-pointer items-center gap-3 rounded-sm border border-border bg-surface px-3 text-body has-checked:border-primary has-focus-visible:outline-2 has-focus-visible:outline-accent"
                >
                  <input type="radio" name="role" value={role.value} defaultChecked={index === 0} className="accent-current" />
                  {role.label}
                </label>
              ))}
            </div>
          </fieldset>

          <Button type="submit" className="w-full" loading={enCours}>
            Continuer
          </Button>
        </fieldset>
      </form>
    </AuthLayout>
  )
}
