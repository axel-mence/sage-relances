import type { ButtonHTMLAttributes } from 'react'

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'secondary'
  size?: 'sm' | 'md'
  // Affiche un indicateur de chargement et bloque le bouton (ex. relance en cours)
  loading?: boolean
}

/*
  Bouton du DS Nudge v2 (composant Figma « Bouton ») :
  - principal : fond accent (noir en clair, citron en sombre), texte accent-on, Inter SemiBold 15
  - secondaire : filet border, texte principal, fond transparent
  Angles de 8 px (radius sm) pour les 2.
*/
const VARIANTS = {
  primary: 'bg-accent text-accent-on hover:bg-accent-hover',
  secondary: 'border border-border text-primary hover:bg-surface-2',
}

const SIZES = {
  // Version compacte pour les lignes de la liste
  sm: 'h-8 px-3 text-label',
  // Taille du DS : 24 px × 12 px de marge intérieure
  md: 'px-6 py-3 text-button',
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
      className={`inline-flex cursor-pointer items-center justify-center gap-2 rounded-sm whitespace-nowrap transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${VARIANTS[variant]} ${SIZES[size]} ${className}`}
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
