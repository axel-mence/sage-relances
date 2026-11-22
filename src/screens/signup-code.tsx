import { useRef, useState, type ClipboardEvent, type KeyboardEvent } from 'react'
import { CodeExpire, renvoyerCode, verifierCode } from '../api/auth-api'
import { AuthLayout } from '../components/auth-layout'
import { LienInterne } from '../components/auth-ui'
import { Button } from '../components/button'
import { historyState, navigate } from '../hooks/use-route'
import { Arguments } from './signup'

const LONGUEUR = 6

/*
  Étape 2 de l'inscription : le code à 6 chiffres reçu par email.
  - 6 cases : chaque chiffre fait passer à la case suivante, Retour arrière revient en arrière,
    un code collé remplit toutes les cases d'un coup ;
  - le code est vérifié dès que la 6e case est remplie ;
  - « Renvoyer le code » et un retour discret pour corriger l'email.
*/
export function SignupCode() {
  const [email] = useState(() => historyState().email)
  const [chiffres, setChiffres] = useState<string[]>(() => Array(LONGUEUR).fill(''))
  const [verification, setVerification] = useState(false)
  const [erreur, setErreur] = useState<string | null>(null)
  const [renvoi, setRenvoi] = useState<'idle' | 'envoi' | 'envoye'>('idle')
  const cases = useRef<(HTMLInputElement | null)[]>([])

  async function verifier(code: string) {
    setVerification(true)
    setErreur(null)
    try {
      await verifierCode(code)
      navigate('/inscription/cabinet')
    } catch (error) {
      setErreur(error instanceof CodeExpire ? error.message : 'Vérification impossible. Réessayez.')
      setVerification(false)
      setChiffres(Array(LONGUEUR).fill(''))
      // Après l'effacement, retour à la première case pour ressaisir
      requestAnimationFrame(() => cases.current[0]?.focus())
    }
  }

  // Remplit les cases à partir de la position donnée ; vérifie si le code est complet
  function remplir(depart: number, saisie: string) {
    const nouveaux = [...chiffres]
    const valeurs = saisie.replace(/\D/g, '').slice(0, LONGUEUR - depart).split('')
    valeurs.forEach((chiffre, i) => (nouveaux[depart + i] = chiffre))
    setChiffres(nouveaux)
    const suivante = Math.min(depart + valeurs.length, LONGUEUR - 1)
    if (valeurs.length > 0) cases.current[suivante]?.focus()
    if (nouveaux.every(Boolean)) verifier(nouveaux.join(''))
  }

  function onKeyDown(index: number, event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === 'Backspace' && !chiffres[index] && index > 0) {
      cases.current[index - 1]?.focus()
    }
  }

  function onPaste(index: number, event: ClipboardEvent<HTMLInputElement>) {
    event.preventDefault()
    remplir(index, event.clipboardData.getData('text'))
  }

  async function renvoyer() {
    setRenvoi('envoi')
    setErreur(null)
    await renvoyerCode()
    setRenvoi('envoye')
  }

  return (
    <AuthLayout title="Vérifiez votre email" aside={<Arguments />}>
      <p className="-mt-4 text-secondary">
        Nous avons envoyé un code à 6 chiffres à <span className="text-primary">{email ?? 'votre adresse'}</span>.
      </p>

      <fieldset disabled={verification} className="flex flex-col gap-3">
        <legend className="sr-only">Code de vérification à 6 chiffres</legend>
        <div className="flex gap-2">
          {chiffres.map((chiffre, index) => (
            <input
              key={index}
              ref={(element) => {
                cases.current[index] = element
              }}
              value={chiffre}
              onChange={(event) => remplir(index, event.target.value.slice(-1))}
              onKeyDown={(event) => onKeyDown(index, event)}
              onPaste={(event) => onPaste(index, event)}
              inputMode="numeric"
              autoComplete={index === 0 ? 'one-time-code' : 'off'}
              maxLength={1}
              autoFocus={index === 0}
              aria-label={`Chiffre ${index + 1} sur ${LONGUEUR}`}
              aria-invalid={erreur !== null || undefined}
              className="h-14 w-full min-w-0 rounded-sm border border-border bg-surface text-center font-display text-section text-primary hover:border-secondary focus:border-primary disabled:opacity-50 aria-invalid:border-status-retard"
            />
          ))}
        </div>

        {verification && <p className="text-label text-secondary">Vérification…</p>}
        {erreur && (
          <p role="alert" className="text-label text-status-retard">
            {erreur}
          </p>
        )}
      </fieldset>

      <div className="flex flex-col items-start gap-4">
        <Button variant="secondary" size="sm" loading={renvoi === 'envoi'} onClick={renvoyer}>
          Renvoyer le code
        </Button>
        {renvoi === 'envoye' && (
          <p role="status" className="text-caption text-secondary">
            Nouveau code envoyé.
          </p>
        )}
        <LienInterne href="/inscription" className="text-label text-secondary hover:text-primary">
          ‹ Modifier l'email
        </LienInterne>
      </div>
    </AuthLayout>
  )
}
