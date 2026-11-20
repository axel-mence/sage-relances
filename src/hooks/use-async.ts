import { useCallback, useEffect, useState } from 'react'

type AsyncState<T> = {
  data?: T
  error?: Error
  loading: boolean
}

// Lance une requête au montage et expose son état (chargement, erreur, données) + une fonction pour réessayer
export function useAsync<T>(request: () => Promise<T>) {
  const [state, setState] = useState<AsyncState<T>>({ loading: true })
  // Incrémenté à chaque « Réessayer » pour relancer la requête
  const [attempt, setAttempt] = useState(0)

  useEffect(() => {
    // Évite de mettre à jour l'état si le composant a été démonté ou si une requête plus récente est partie
    let ignore = false

    request()
      .then((data) => !ignore && setState({ data, loading: false }))
      .catch((error: Error) => !ignore && setState({ error, loading: false }))

    return () => {
      ignore = true
    }
  }, [request, attempt])

  // Repasse en chargement puis relance la requête
  const reload = useCallback(() => {
    setState((prev) => ({ ...prev, loading: true, error: undefined }))
    setAttempt((n) => n + 1)
  }, [])

  return { ...state, reload }
}
