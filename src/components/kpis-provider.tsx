import type { ReactNode } from 'react'
import { api } from '../api/clients-api'
import { useAsync } from '../hooks/use-async'
import { KpisContext } from '../hooks/kpis-context'

// Charge les indicateurs une fois pour toute l'application (voir kpis-context)
export function KpisProvider({ children }: { children: ReactNode }) {
  const kpis = useAsync(api.getKpis)
  return <KpisContext.Provider value={kpis}>{children}</KpisContext.Provider>
}
