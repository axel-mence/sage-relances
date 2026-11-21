import { useCallback, useState } from 'react'
import { GROUPS } from '../domain/filters'
import type { DossierStatus } from '../domain/types'

type OpenGroups = Record<DossierStatus, boolean>

const STORAGE_KEY = 'relance-pieces:groupes-ouverts'

const DEFAULTS = Object.fromEntries(GROUPS.map((g) => [g.status, g.openByDefault])) as OpenGroups

// Lit l'état sauvegardé pour cet onglet du navigateur (sessionStorage), sinon les valeurs par défaut
function readSaved(): OpenGroups {
  try {
    const saved = sessionStorage.getItem(STORAGE_KEY)
    return saved ? { ...DEFAULTS, ...JSON.parse(saved) } : DEFAULTS
  } catch {
    // Stockage bloqué (navigation privée, réglages) : on repart des valeurs par défaut
    return DEFAULTS
  }
}

/*
  Groupes ouverts ou fermés, conservés pendant la session (même après un rechargement de la page).
  sessionStorage : mémoire du navigateur propre à l'onglet, effacée à sa fermeture.
*/
export function useOpenGroups() {
  const [open, setOpen] = useState<OpenGroups>(readSaved)

  const save = (next: OpenGroups) => {
    try {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(next))
    } catch {
      // Pas grave : l'état reste valable tant que la page est ouverte
    }
    return next
  }

  const toggle = useCallback((status: DossierStatus) => {
    setOpen((prev) => save({ ...prev, [status]: !prev[status] }))
  }, [])

  const openGroup = useCallback((status: DossierStatus) => {
    setOpen((prev) => (prev[status] ? prev : save({ ...prev, [status]: true })))
  }, [])

  return { open, toggle, openGroup }
}
