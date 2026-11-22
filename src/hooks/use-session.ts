import { useMemo, useSyncExternalStore } from 'react'
import { abonnerSession, instantaneSession, type Compte } from '../api/auth-api'

/*
  Compte connecté (ou null), mis à jour partout dès qu'il change :
  connexion, déconnexion, infos du cabinet, connecteurs.
*/
export function useSession(): Compte | null {
  const instantane = useSyncExternalStore(abonnerSession, instantaneSession)
  return useMemo(() => (instantane ? (JSON.parse(instantane) as Compte) : null), [instantane])
}

// Libellé du rôle affiché sous le nom
export function libelleRole(compte: Compte) {
  return compte.role === 'collaborateur' ? 'Collaborateur' : 'Associé'
}
