import { useCallback, useState } from 'react'

export type Toast = {
  id: number
  message: string
  tone: 'success' | 'error'
}

// Durée d'affichage d'un toast avant disparition automatique
const DUREE_TOAST_MS = 4000

let prochainId = 0

// Pile de toasts : show() en ajoute un, qui disparaît seul au bout de 4 secondes
export function useToasts() {
  const [toasts, setToasts] = useState<Toast[]>([])

  const dismiss = useCallback((id: number) => {
    setToasts((list) => list.filter((t) => t.id !== id))
  }, [])

  const show = useCallback(
    (message: string, tone: Toast['tone'] = 'success') => {
      prochainId += 1
      const id = prochainId
      setToasts((list) => [...list, { id, message, tone }])
      setTimeout(() => dismiss(id), DUREE_TOAST_MS)
    },
    [dismiss],
  )

  return { toasts, show, dismiss }
}
