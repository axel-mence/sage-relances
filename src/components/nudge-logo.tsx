// ?raw : Vite importe le contenu texte du SVG, pour l'insérer tel quel dans la page.
// Le SVG hérite ainsi de la couleur du texte (currentColor) et suit le thème clair ou sombre.
import logoSvg from '../assets/nudge-logo.svg?raw'
import markSvg from '../assets/nudge-mark.svg?raw'

type NudgeLogoProps = {
  // « logo » : symbole + mot « nudge » ; « mark » : symbole seul
  variant?: 'logo' | 'mark'
  className?: string
}

/*
  Logo Nudge (fichiers dans src/assets, issus de DA/logo).
  Le SVG est dimensionné par la classe passée (ex. h-7 w-auto), sa couleur par text-*.
  Le libellé « Nudge » est porté par le SVG lui-même (role="img" + aria-label).
*/
export function NudgeLogo({ variant = 'logo', className = '' }: NudgeLogoProps) {
  return (
    <span
      className={`inline-flex [&>svg]:h-full [&>svg]:w-auto ${className}`}
      // Contenu sûr : fichier SVG du projet, pas une donnée saisie par un utilisateur
      dangerouslySetInnerHTML={{ __html: variant === 'logo' ? logoSvg : markSvg }}
    />
  )
}
