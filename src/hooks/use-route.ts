import { useSyncExternalStore } from 'react'

/*
  Routeur maison, sans bibliothèque : 2 pages suffisent (liste et fiche client).
  Il s'appuie sur l'historique du navigateur (History API) : l'adresse change sans recharger la page,
  et les boutons précédent / suivant du navigateur fonctionnent.

  Chaque entrée d'historique garde un « état » :
  - sur la liste : la position de défilement, pour la retrouver au retour ;
  - sur une fiche : l'ordre de la liste filtrée, pour les flèches précédent / suivant.
*/
export type ListeOrigine = {
  slugs: string[] // ordre des clients dans la liste au moment du clic
  libelle: string // « En retard », « Tous »… affiché à côté de la position
}

export type HistoryState = {
  scrollY?: number
  // Page d'où l'on a ouvert une fiche : le lien retour y ramène (« ‹ Tableau de bord », « ‹ Clients »)
  depuis?: { path: string; libelle: string }
  liste?: ListeOrigine
}

// Le navigateur ne doit pas restaurer le défilement tout seul : on le fait nous-mêmes au bon moment
if (typeof window !== 'undefined') window.history.scrollRestoration = 'manual'

const listeners = new Set<() => void>()

function subscribe(listener: () => void) {
  listeners.add(listener)
  window.addEventListener('popstate', listener)
  return () => {
    listeners.delete(listener)
    window.removeEventListener('popstate', listener)
  }
}

/*
  Va vers une nouvelle adresse, en mémorisant d'abord la position de défilement de la page quittée.
  replace : remplace l'entrée courante au lieu d'en ajouter une (précédent / suivant entre fiches :
  le retour du navigateur ramène alors à la page d'origine, pas au client d'avant).
*/
export function navigate(path: string, state: HistoryState = {}, { replace = false } = {}) {
  if (replace) {
    window.history.replaceState(state, '', path)
  } else {
    window.history.replaceState({ ...window.history.state, scrollY: window.scrollY }, '')
    window.history.pushState(state, '', path)
  }
  listeners.forEach((listener) => listener())
}

export function historyState(): HistoryState {
  return (window.history.state as HistoryState | null) ?? {}
}

// Chemin courant (« / » ou « /clients/garage-peyrot »), mis à jour à chaque navigation
export function usePath(): string {
  return useSyncExternalStore(subscribe, () => window.location.pathname)
}

// « /clients/garage-peyrot » → « garage-peyrot », sinon undefined
export function clientSlugFromPath(path: string): string | undefined {
  return path.match(/^\/clients\/([^/]+)\/?$/)?.[1]
}

/*
  Retour depuis une fiche. Si on vient d'une page de l'app, on recule dans l'historique : le navigateur
  retrouve alors cette page avec sa position de défilement.
  Si la fiche a été ouverte depuis un lien partagé, il n'y a rien derrière : on va à l'annuaire des clients.
*/
export function backFromClient() {
  if (historyState().depuis) window.history.back()
  else navigate('/clients')
}

// Libellé du lien retour de la fiche : la page d'où l'on vient, sinon l'annuaire
export function backLabel(): string {
  return historyState().depuis?.libelle ?? 'Clients'
}

// « /clients » : l'annuaire des clients
export function isClientsPath(path: string): boolean {
  return /^\/clients\/?$/.test(path)
}
