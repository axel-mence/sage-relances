import { useCallback, useEffect, useState } from 'react'
import { api } from '../api/clients-api'
import { parGravite } from '../domain/filters'
import { voisins } from '../domain/voisins'
import { useAsync } from '../hooks/use-async'
import { historyState, navigate, type ListeOrigine } from '../hooks/use-route'

type ClientNavigatorProps = {
  slug: string
}

/*
  Liste parcourue par les flèches : celle de la page d'origine (tableau de bord filtré ou annuaire),
  transmise dans l'historique. Fiche ouverte depuis un lien partagé : tous les clients, par gravité.
*/
function useListeOrigine(): ListeOrigine | undefined {
  // Lue une fois à l'ouverture de la fiche
  const [transmise] = useState(() => historyState().liste)
  const request = useCallback(() => (transmise ? Promise.resolve(undefined) : api.getClients()), [transmise])
  const tous = useAsync(request)
  if (transmise) return transmise
  if (!tous.data) return undefined
  return { slugs: [...tous.data].sort(parGravite).map((c) => c.slug), libelle: 'Tous' }
}

// Vrai si la touche est tapée dans un champ (on ne détourne pas la saisie) ou si une fenêtre est ouverte
function ignorerRaccourci(event: KeyboardEvent) {
  const cible = event.target as HTMLElement | null
  return (
    event.metaKey ||
    event.ctrlKey ||
    event.altKey ||
    cible?.closest('input, textarea, select, [contenteditable="true"]') !== null ||
    document.querySelector('dialog[open]') !== null
  )
}

/*
  Flèches précédent / suivant de la fiche (référence Attio ↑ ↓ « 3 sur 6 ») : on enchaîne les clients
  de la liste d'origine sans y revenir. Raccourcis J (suivant) et K (précédent).
  On remplace l'entrée d'historique : « retour » ramène à la page d'origine, pas au client d'avant.
*/
export function ClientNavigator({ slug }: ClientNavigatorProps) {
  const liste = useListeOrigine()
  const position = liste && voisins(liste.slugs, slug)

  const aller = useCallback(
    (cible?: string) => {
      if (!cible) return
      navigate(`/clients/${cible}`, { ...historyState(), liste }, { replace: true })
    },
    [liste],
  )

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (ignorerRaccourci(event)) return
      if (event.key === 'j' || event.key === 'J') aller(position?.suivant)
      if (event.key === 'k' || event.key === 'K') aller(position?.precedent)
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [aller, position?.suivant, position?.precedent])

  if (!position) return null

  const bouton =
    'grid size-8 cursor-pointer place-items-center rounded-sm border border-border text-primary transition-colors hover:bg-surface-2 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-transparent'

  return (
    <nav aria-label="Clients de la liste" className="flex items-center gap-2">
      <span className="text-caption text-secondary tabular-nums">
        {position.position} sur {position.total} · {liste.libelle}
      </span>
      <button
        type="button"
        aria-label="Client précédent (K)"
        aria-keyshortcuts="K"
        title="Client précédent (K)"
        disabled={!position.precedent}
        onClick={() => aller(position.precedent)}
        className={bouton}
      >
        <svg aria-hidden="true" viewBox="0 0 16 16" className="size-4">
          <path d="M4 10l4-4 4 4" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
      <button
        type="button"
        aria-label="Client suivant (J)"
        aria-keyshortcuts="J"
        title="Client suivant (J)"
        disabled={!position.suivant}
        onClick={() => aller(position.suivant)}
        className={bouton}
      >
        <svg aria-hidden="true" viewBox="0 0 16 16" className="size-4">
          <path d="M4 6l4 4 4-4" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
    </nav>
  )
}
