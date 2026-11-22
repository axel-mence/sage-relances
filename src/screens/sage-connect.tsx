import { useEffect, useRef, useState } from 'react'
import { autoriserSage } from '../api/auth-api'
import { TOTAL_DOSSIERS_CABINET } from '../api/clients-api'
import { AuthLayout } from '../components/auth-layout'
import { IconeCoche, LienInterne, LogoSage } from '../components/auth-ui'
import { Button } from '../components/button'
import { NudgeLogo } from '../components/nudge-logo'
import { Toasts } from '../components/toasts'
import { historyState, navigate } from '../hooks/use-route'
import { useToasts } from '../hooks/use-toasts'
import { Arguments } from './signup'

/*
  Connexion du logiciel comptable Sage (refs-auth/connexion-api-sage), tout est simulé :
  1. choix du logiciel (Sage en premier, les autres « Bientôt ») ;
  2. autorisation des droits (étape 1 sur 2) ;
  3. import des dossiers clients (étape 2 sur 2) ;
  4. retour sur le choix : badge « Connecté » + toast.
*/

// Autres logiciels, grisés : seul Sage est branché dans cette version
const AUTRES_LOGICIELS = ['Cegid', 'Pennylane', 'ACD']

// Ce que Nudge pourra faire dans le dossier Sage (écran d'autorisation)
const DROITS = ['Lire la liste des pièces attendues', 'Lire les pièces reçues', 'Ne jamais modifier vos écritures']

// Écran 1 · Choix du logiciel comptable
export function SageChoix() {
  const [retour] = useState(() => historyState().sage)
  const { toasts, show, dismiss } = useToasts()
  const connecte = retour === 'connecte'
  // Le toast ne doit partir qu'une fois (React rejoue les effets 2 fois en développement)
  const toastAffiche = useRef(false)

  // Retour d'un import réussi : on le confirme par un toast
  useEffect(() => {
    if (!connecte || toastAffiche.current) return
    toastAffiche.current = true
    show(`Sage est connecté. ${TOTAL_DOSSIERS_CABINET} dossiers importés.`)
  }, [connecte, show])

  return (
    <AuthLayout title="Connectez votre logiciel comptable" aside={<Arguments />}>
      <p className="-mt-4 text-secondary">Nudge y lit les pièces attendues et celles déjà reçues.</p>

      {retour === 'annule' && (
        <div role="alert" className="flex items-center justify-between gap-3 rounded-sm border border-status-retard/40 bg-status-retard-bg px-4 py-3">
          <span className="text-label text-status-retard">Vous avez annulé la connexion.</span>
          <Button variant="secondary" size="sm" onClick={() => navigate('/onboarding/sage/autoriser')}>
            Réessayer
          </Button>
        </div>
      )}

      <ul className="flex flex-col gap-3">
        {/* Sage en premier, seule carte active */}
        <li className="flex items-center gap-4 rounded-md border border-border bg-surface p-4">
          <LogoSage className="size-10 text-section" />
          <div className="flex flex-1 flex-col">
            <span className="text-label text-primary">Sage</span>
            <span className="text-caption text-secondary">Sage 50, Sage 100, Génération Experts</span>
          </div>
          {connecte ? (
            <span className="flex items-center gap-1.5 rounded-xs bg-status-recue-bg px-2 py-1 text-caption text-status-recue">
              <IconeCoche className="size-3.5" />
              Connecté
            </span>
          ) : (
            <Button size="sm" onClick={() => navigate('/onboarding/sage/autoriser')}>
              Connecter
            </Button>
          )}
        </li>

        {AUTRES_LOGICIELS.map((nom) => (
          <li key={nom} className="flex items-center gap-4 rounded-md border border-dashed border-border p-4 text-muted">
            <span aria-hidden="true" className="grid size-10 place-items-center rounded-xs bg-surface-2 font-display text-section">
              {nom[0]}
            </span>
            <span className="flex-1 text-label">{nom}</span>
            <span className="text-caption">Bientôt</span>
          </li>
        ))}
      </ul>

      {connecte ? (
        <Button className="w-full" onClick={() => navigate('/', { invitation: true })}>
          Accéder au tableau de bord
        </Button>
      ) : (
        <LienInterne href="/" state={{ invitation: true }} className="text-center text-label text-secondary hover:text-primary">
          Passer cette étape
        </LienInterne>
      )}

      <Toasts toasts={toasts} onDismiss={dismiss} />
    </AuthLayout>
  )
}

// Écran 2 · Autorisation des droits (étape 1 sur 2)
export function SageAutoriser() {
  const [enCours, setEnCours] = useState(false)

  async function autoriser() {
    setEnCours(true)
    await autoriserSage()
    navigate('/onboarding/sage/import', {}, { replace: true })
  }

  return (
    <AuthLayout title="Nudge souhaite accéder à votre dossier Sage" aside={<Arguments />}>
      <div className="-mt-4 flex flex-col gap-6">
        <p className="text-caption text-secondary">Étape 1 sur 2</p>

        {/* Nudge et Sage reliés par une ligne pointillée, bouclier au milieu */}
        <div aria-hidden="true" className="flex items-center gap-2">
          <span className="grid size-12 place-items-center rounded-sm border border-border bg-surface">
            <NudgeLogo variant="mark" className="h-6 text-primary" />
          </span>
          <span className="flex-1 border-t-2 border-dashed border-border" />
          <svg viewBox="0 0 16 16" className="size-5 text-secondary">
            <path d="M8 1.5l5 2v4c0 3.2-2.1 5.6-5 7-2.9-1.4-5-3.8-5-7v-4l5-2Z" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round" />
            <path d="M5.8 8l1.6 1.6 2.8-3" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <span className="flex-1 border-t-2 border-dashed border-border" />
          <LogoSage className="size-12 text-title" />
        </div>

        <div className="flex flex-col gap-4 rounded-md border border-border bg-surface p-5">
          <span className="text-label text-primary">En autorisant, Nudge pourra :</span>
          <ul className="flex flex-col gap-3">
            {DROITS.map((droit) => (
              <li key={droit} className="flex items-center gap-3 text-body text-primary">
                <span className="text-status-recue">
                  <IconeCoche />
                </span>
                {droit}
              </li>
            ))}
          </ul>

          {/* Accordion natif : ouvrable au clavier sans code */}
          <details className="border-t border-border pt-3 text-caption text-secondary">
            <summary className="cursor-pointer text-label text-primary">Voir le détail des données partagées</summary>
            <ul className="mt-3 flex list-disc flex-col gap-1 pl-5">
              <li>Liste de vos dossiers clients (nom, contact)</li>
              <li>Pièces attendues par dossier et leur échéance</li>
              <li>Date de réception des pièces déjà déposées</li>
            </ul>
            <p className="mt-3">Nudge n'a jamais accès à vos écritures comptables ni aux montants.</p>
          </details>
        </div>

        <div className="flex flex-col gap-3">
          <Button className="w-full" loading={enCours} onClick={autoriser}>
            Autoriser
          </Button>
          <Button
            variant="secondary"
            className="w-full"
            disabled={enCours}
            onClick={() => navigate('/onboarding/sage', { sage: 'annule' }, { replace: true })}
          >
            Annuler
          </Button>
        </div>
      </div>
    </AuthLayout>
  )
}

// Durée simulée de l'import et pas du compteur
const IMPORT_MS = 3000
const PAS_MS = 50

// Écran 3 · Import des dossiers (étape 2 sur 2) : compteur qui défile, puis retour au choix
export function SageImport() {
  const [importes, setImportes] = useState(0)

  useEffect(() => {
    const increment = Math.ceil(TOTAL_DOSSIERS_CABINET / (IMPORT_MS / PAS_MS))
    const minuteur = window.setInterval(() => {
      setImportes((n) => Math.min(n + increment, TOTAL_DOSSIERS_CABINET))
    }, PAS_MS)
    return () => window.clearInterval(minuteur)
  }, [])

  // Import terminé : petite pause pour lire le total, puis retour sur le choix avec « Connecté »
  useEffect(() => {
    if (importes < TOTAL_DOSSIERS_CABINET) return
    const fin = window.setTimeout(() => navigate('/onboarding/sage', { sage: 'connecte' }, { replace: true }), 600)
    return () => window.clearTimeout(fin)
  }, [importes])

  return (
    <AuthLayout title="Récupération de vos dossiers clients…" aside={<Arguments />}>
      <div className="-mt-4 flex flex-col gap-6">
        <p className="text-caption text-secondary">Étape 2 sur 2</p>

        <div className="flex items-center gap-4">
          <LogoSage className="size-12 text-title" />
          {/* Loader Nudge : une flèche qui monte en boucle (immobile si mouvement réduit) */}
          <span aria-hidden="true" className="grid size-12 place-items-center rounded-full bg-accent-subtle text-primary">
            <svg viewBox="0 0 16 16" className="size-5 animate-bounce motion-reduce:animate-none">
              <path d="M8 13V3M4 7l4-4 4 4" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </span>
        </div>

        <div className="flex flex-col gap-2">
          <div
            role="progressbar"
            aria-label="Import des dossiers"
            aria-valuemin={0}
            aria-valuemax={TOTAL_DOSSIERS_CABINET}
            aria-valuenow={importes}
            className="h-2 overflow-hidden rounded-pill bg-surface-2"
          >
            <div className="h-full rounded-pill bg-status-recue transition-[width]" style={{ width: `${(importes / TOTAL_DOSSIERS_CABINET) * 100}%` }} />
          </div>
          <p className="font-display text-section text-primary tabular-nums">
            {importes} dossiers importés
          </p>
          <p className="text-caption text-secondary">Ne fermez pas cette page, cela prend quelques secondes.</p>
        </div>
      </div>
    </AuthLayout>
  )
}
