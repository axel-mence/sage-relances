type AvatarProps = {
  // Taille du cercle : sm = 32 px, md = 40 px
  size?: 'sm' | 'md'
}

/*
  Avatar rond avec une « photo » fictive : une silhouette dessinée (pas de vraie photo de personne),
  sur le vert sapin de la marque, cerclée d'un filet accent.
  Décoratif : le nom est toujours écrit à côté, donc caché aux lecteurs d'écran.
*/
export function Avatar({ size = 'md' }: AvatarProps) {
  return (
    <span
      aria-hidden="true"
      className={`grid shrink-0 place-items-center overflow-hidden rounded-full bg-brand-teal ring-2 ring-accent ring-offset-2 ring-offset-surface ${
        size === 'md' ? 'size-10' : 'size-8'
      }`}
    >
      <svg viewBox="0 0 40 40" className="size-full translate-y-1">
        {/* Tête et épaules */}
        <circle cx="20" cy="15" r="7" fill="#d4f53c" />
        <path d="M6 40c0-8 6.3-13 14-13s14 5 14 13Z" fill="#d4f53c" />
      </svg>
    </span>
  )
}
