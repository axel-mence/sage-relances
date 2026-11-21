import type { HTMLAttributes } from 'react'

/*
  Label de section du DS Nudge v2 : Inter Medium 12/16, MAJUSCULES, interlettrage 0.1em,
  couleur accent (citron en sombre, comme le demande le brief ; noir en clair).
  Les majuscules viennent du CSS : le texte reste écrit normalement (meilleur pour les lecteurs d'écran).
*/
export function SectionLabel({ className = '', ...rest }: HTMLAttributes<HTMLSpanElement>) {
  return <span className={`text-overline text-accent uppercase ${className}`} {...rest} />
}
