import type { HTMLAttributes } from 'react'

type CardProps = HTMLAttributes<HTMLDivElement> & {
  // Fond sombre « surface » (par défaut) ou clair « mist »
  tone?: 'dark' | 'light'
}

/*
  Carte Nudge (brief, section 4) : angles de 24 px, pas d'ombre, marge intérieure de 32 à 40 px.
  Sur mobile, la marge descend à 24 px pour garder de la place au contenu.
*/
export function Card({ tone = 'dark', className = '', ...rest }: CardProps) {
  const fond = tone === 'dark' ? 'bg-nudge-surface text-mist' : 'bg-mist text-ink'
  return <div className={`rounded-card p-6 sm:p-8 lg:p-10 ${fond} ${className}`} {...rest} />
}
