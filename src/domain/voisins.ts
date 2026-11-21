// Position d'un client dans une liste, et ses voisins (flèches précédent / suivant de la fiche)
export type Voisins = {
  position: number // 1 pour le premier
  total: number
  precedent?: string // slug du client d'avant (absent pour le premier)
  suivant?: string // slug du client d'après (absent pour le dernier)
}

// undefined si le client n'est pas dans la liste (par exemple filtre changé depuis)
export function voisins(slugs: string[], slug: string): Voisins | undefined {
  const index = slugs.indexOf(slug)
  if (index === -1) return undefined
  return {
    position: index + 1,
    total: slugs.length,
    precedent: slugs[index - 1],
    suivant: slugs[index + 1],
  }
}
