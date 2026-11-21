import { useCallback, useEffect, useState } from 'react'

type AsyncState<T> = {
  data?: T
  error?: Error
  loading: boolean
}

// Lance une requête au montage et expose son état (chargement, erreur, données) + des fonctions pour la piloter
export function useAsync<T>(request: () => Promise<T>) {
  const [state, setState] = useState<AsyncState<T>>({ loading: true })
  // Incrémenté à chaque rechargement pour relancer la requête
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

  /*
    Relance la requête.
    - Par défaut, repasse en chargement (bouton « Réessayer »).
    - En mode silencieux, garde les données affichées pendant la mise à jour (rafraîchir les KPI après une relance).
  */
  const reload = useCallback((options: { silent?: boolean } = {}) => {
    if (!options.silent) setState((prev) => ({ ...prev, loading: true, error: undefined }))
    setAttempt((n) => n + 1)
  }, [])

  // Modifie les données déjà chargées sans refaire de requête (ex. remplacer un client après sa relance)
  const update = useCallback((updater: (data: T) => T) => {
    setState((prev) => (prev.data === undefined ? prev : { ...prev, data: updater(prev.data) }))
  }, [])

  return { ...state, reload, update }
}
