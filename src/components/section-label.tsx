import type { HTMLAttributes } from 'react'

/*
  Label de section Nudge (brief, section 3) : Inter 500, MAJUSCULES, interlettrage 0.1em, citron.
  Les majuscules viennent du CSS : le texte reste écrit normalement dans le code (meilleur pour les lecteurs d'écran).
*/
export function SectionLabel({ className = '', ...rest }: HTMLAttributes<HTMLSpanElement>) {
  return <span className={`text-caption font-medium tracking-label text-lime uppercase ${className}`} {...rest} />
}
