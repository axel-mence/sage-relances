import type { HTMLAttributes } from 'react'

/*
  Carte du DS Nudge v2 (base du composant Figma « Carte KPI ») :
  fond surface, filet border, angles de 16 px, 24 px de marge intérieure, pas d'ombre.
*/
export function Card({ className = '', ...rest }: HTMLAttributes<HTMLDivElement>) {
  return <div className={`rounded-md border border-border bg-surface p-6 ${className}`} {...rest} />
}
