import { useEffect, useState } from 'react'

// Heure courante, rafraîchie chaque minute : les « Il y a x h » et « À l'instant » restent justes
export function useNow(intervalMs = 60_000) {
  const [now, setNow] = useState(() => new Date())

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), intervalMs)
    return () => clearInterval(timer)
  }, [intervalMs])

  return now
}
