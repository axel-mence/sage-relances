import type { ButtonHTMLAttributes } from 'react'

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'secondary'
  size?: 'sm' | 'md'
  // Affiche un indicateur de chargement et bloque le bouton (ex. relance en cours)
  loading?: boolean
}

/*
  Chaque variante porte 2 looks : DS v1 (par défaut) et Nudge (préfixe nudge:, actif dans .theme-nudge).
  Nudge (brief, section 4) :
  - principal : fond citron, texte noir, Inter 600, arrondi complet (le seul bouton en « pill »)
  - secondaire : fond sombre surface-2, filet blanc discret, angles de 8 px comme les chips
*/
const VARIANTS = {
  primary: [
    'rounded-md bg-accent-strong text-white hover:bg-accent-strong-hover',
    'nudge:rounded-pill nudge:bg-lime nudge:text-ink nudge:font-semibold nudge:hover:bg-mist',
  ].join(' '),
  secondary: [
    'rounded-md bg-surface text-primary border border-border hover:bg-page',
    'nudge:bg-surface-2 nudge:text-mist nudge:border-white/10 nudge:hover:border-white/40 nudge:hover:bg-surface-2',
  ].join(' '),
}

const SIZES = {
  sm: 'h-8 px-3 text-label',
  // Bouton principal Nudge : 16 px × 28 px de marge intérieure (brief)
  md: 'h-10 px-4 text-label nudge:h-auto nudge:px-7 nudge:py-4 nudge:text-body',
}

export function Button({
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled,
  className = '',
  children,
  type = 'button',
  ...rest
}: ButtonProps) {
  const isDisabled = disabled || loading

  return (
    <button
      type={type}
      disabled={isDisabled}
      aria-busy={loading || undefined}
      className={`inline-flex items-center justify-center gap-2 whitespace-nowrap transition-colors cursor-pointer disabled:cursor-not-allowed disabled:opacity-50 ${VARIANTS[variant]} ${SIZES[size]} ${className}`}
      {...rest}
    >
      {loading && (
        <span
          aria-hidden="true"
          className="size-3.5 animate-spin rounded-full border-2 border-current border-t-transparent"
        />
      )}
      {children}
    </button>
  )
}
