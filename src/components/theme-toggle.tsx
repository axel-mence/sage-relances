import { useTheme, type Theme } from '../hooks/use-theme'

const OPTIONS: { value: Theme; label: string; icon: string }[] = [
  // Soleil et lune : simples tracés, la couleur suit le texte
  { value: 'light', label: 'Clair', icon: 'M8 3V1.5M8 14.5V13M3 8H1.5M14.5 8H13M4.5 4.5 3.4 3.4M12.6 12.6l-1.1-1.1M4.5 11.5l-1.1 1.1M12.6 3.4l-1.1 1.1M10.5 8a2.5 2.5 0 1 1-5 0 2.5 2.5 0 0 1 5 0Z' },
  { value: 'dark', label: 'Sombre', icon: 'M13.5 9.5A5.5 5.5 0 0 1 6.5 2.5a5.5 5.5 0 1 0 7 7Z' },
]

type ThemeToggleProps = {
  // Version compacte (icônes seules) pour la barre du haut sur mobile
  compact?: boolean
}

/*
  Pastille clair / sombre : 2 boutons de même largeur qui remplissent le conteneur, celui du thème actif est mis en avant.
  Contour de focus collé au bouton (offset 0) pour ne pas déborder du conteneur.
  aria-pressed annonce aux lecteurs d'écran lequel est choisi.
*/
export function ThemeToggle({ compact = false }: ThemeToggleProps) {
  const { theme, setTheme } = useTheme()

  return (
    <div role="group" aria-label="Thème d'affichage" className="flex rounded-sm border border-border bg-surface p-0.5">
      {OPTIONS.map((option) => {
        const active = theme === option.value
        return (
          <button
            key={option.value}
            type="button"
            aria-pressed={active}
            aria-label={compact ? `Thème ${option.label.toLowerCase()}` : undefined}
            onClick={() => setTheme(option.value)}
            className={`flex h-7 flex-1 cursor-pointer items-center justify-center gap-1.5 rounded-xs px-2 text-caption transition-colors focus-visible:outline-offset-0 ${
              active ? 'bg-accent text-accent-on' : 'text-secondary hover:text-primary'
            }`}
          >
            <svg aria-hidden="true" viewBox="0 0 16 16" className="size-3.5">
              <path d={option.icon} fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            {!compact && option.label}
          </button>
        )
      })}
    </div>
  )
}
