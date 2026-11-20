import type { ButtonHTMLAttributes } from 'react'

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'secondary'
  size?: 'sm' | 'md'
  // Affiche un indicateur de chargement et bloque le bouton (ex. relance en cours)
  loading?: boolean
}

const VARIANTS = {
  primary: 'bg-accent-strong text-white hover:bg-accent-strong-hover',
  secondary: 'bg-surface text-primary border border-border hover:bg-page',
}

const SIZES = {
  sm: 'h-8 px-3 text-label',
  md: 'h-10 px-4 text-label',
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
      className={`inline-flex items-center justify-center gap-2 rounded-md whitespace-nowrap transition-colors cursor-pointer disabled:cursor-not-allowed disabled:opacity-50 ${VARIANTS[variant]} ${SIZES[size]} ${className}`}
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
