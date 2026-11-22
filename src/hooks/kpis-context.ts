import { createContext, useContext } from 'react'
import type { Kpis } from '../domain/types'

/*
  Indicateurs du cabinet (temps gagné, relances de la semaine), partagés par toute l'application :
  la barre latérale les affiche, et chaque relance (tableau de bord ou fiche) les rafraîchit.
*/
export type KpisState = {
  data?: Kpis
  loading: boolean
  error?: Error
  reload: (options?: { silent?: boolean }) => void
}

export const KpisContext = createContext<KpisState>({ loading: true, reload: () => {} })

export function useKpis(): KpisState {
  return useContext(KpisContext)
}
