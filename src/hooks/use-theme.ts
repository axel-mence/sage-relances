import { useCallback, useState } from 'react'

export type Theme = 'light' | 'dark'

// Même clé que le petit script de index.html, qui applique le thème avant l'affichage
const STORAGE_KEY = 'nudge:theme'

/*
  Thème clair (par défaut) ou sombre, mémorisé dans le navigateur (localStorage).
  Le mode sombre = classe .theme-dark sur <html> : tous les tokens du DS changent de valeur d'un coup.
*/
export function useTheme() {
  const [theme, setThemeState] = useState<Theme>(() =>
    document.documentElement.classList.contains('theme-dark') ? 'dark' : 'light',
  )

  const setTheme = useCallback((next: Theme) => {
    document.documentElement.classList.toggle('theme-dark', next === 'dark')
    try {
      localStorage.setItem(STORAGE_KEY, next)
    } catch {
      // Stockage bloqué : le choix reste valable tant que la page est ouverte
    }
    setThemeState(next)
  }, [])

  return { theme, setTheme }
}
