import type { MouseEvent, ReactNode } from 'react'
import { navigate, type HistoryState } from '../hooks/use-route'

/*
  Petits éléments communs aux pages d'auth (connexion, inscription, code, cabinet).
  Tous reprennent les tokens du DS, aucun nouveau style.
*/

// Champ de saisie commun (email, mot de passe, nom du cabinet…)
export const CHAMP =
  'h-11 w-full rounded-sm border border-border bg-surface px-3 text-body text-primary placeholder:text-muted hover:border-secondary focus:border-primary disabled:opacity-50 aria-invalid:border-status-retard'

type LienInterneProps = {
  href: string
  children: ReactNode
  className?: string
  // État transmis à la page d'arrivée (ex. ouvrir la modale d'invitation)
  state?: HistoryState
}

// Lien interne : change de page sans recharger (routeur maison)
export function LienInterne({ href, children, className = '', state }: LienInterneProps) {
  return (
    <a
      href={href}
      onClick={(event: MouseEvent) => {
        event.preventDefault()
        navigate(href, state)
      }}
      className={className}
    >
      {children}
    </a>
  )
}

// Séparateur « ou » entre les boutons SSO et le formulaire email
export function SeparateurOu() {
  return (
    <div className="flex items-center gap-3 text-caption text-muted">
      <span className="h-px flex-1 bg-border" />
      ou
      <span className="h-px flex-1 bg-border" />
    </div>
  )
}

// Badge « Dernière méthode utilisée » accroché en haut à droite du bouton (comme le « Last used » de Lovable)
export function AvecBadge({ visible, children }: { visible: boolean; children: ReactNode }) {
  return (
    <div className="relative">
      {children}
      {visible && (
        <span className="absolute -top-2.5 right-3 rounded-xs border border-border bg-surface px-2 py-0.5 text-caption text-secondary">
          Dernière méthode utilisée
        </span>
      )}
    </div>
  )
}

// Logo Sage générique (pas le logo officiel) : un carré vert avec un « S ». Taille réglable (bouton ou grande vignette)
export function LogoSage({ className = 'size-5 text-caption' }: { className?: string }) {
  return (
    <span
      aria-hidden="true"
      className={`grid shrink-0 place-items-center rounded-xs bg-status-recue font-display font-semibold text-on-inverse ${className}`}
    >
      S
    </span>
  )
}

// « G » simple au trait, sans les couleurs de la marque
export function LogoGoogle() {
  return (
    <svg aria-hidden="true" viewBox="0 0 16 16" className="size-4">
      <path d="M13.5 8.2H8.3M13.5 8.2A5.5 5.5 0 1 1 11.9 4" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  )
}

// Coche des listes du panneau droit et des cartes de confirmation
export function IconeCoche({ className = 'size-4' }: { className?: string }) {
  return (
    <svg aria-hidden="true" viewBox="0 0 16 16" className={className}>
      <path d="M3.5 8.5l3 3 6-7" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}
