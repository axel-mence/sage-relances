import { useEffect, useState } from 'react'

/*
  Hauteur d'un élément, mise à jour quand il change de taille (ResizeObserver).
  Sert au sticky de la liste : les titres de colonnes se collent juste sous la barre de filtres,
  dont la hauteur varie (les pastilles passent sur 2 lignes sur les écrans étroits).
*/
export function useElementHeight<T extends HTMLElement>(element: T | null) {
  const [height, setHeight] = useState(0)

  useEffect(() => {
    if (!element) return
    const observer = new ResizeObserver(([entry]) => setHeight(entry.borderBoxSize[0]?.blockSize ?? 0))
    observer.observe(element)
    return () => observer.disconnect()
  }, [element])

  return height
}
