import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react'

type SidePanelProps = {
  // id du titre du panneau, pour que les lecteurs d'écran l'annoncent à l'ouverture
  labelledBy: string
  // Appelé une fois le panneau fermé (le parent le retire alors de la page)
  onClose: () => void
  // Le contenu reçoit la fonction « fermer » pour son bouton ✕
  children: (close: () => void) => ReactNode
}

/*
  Panneau latéral ancré à droite (440 px, plein écran sur mobile), fond assombri derrière.
  Basé sur l'élément HTML <dialog> en mode modal, qui gère tout seul :
  - la touche Échap pour fermer,
  - le focus gardé dans le panneau tant qu'il est ouvert,
  - le retour du focus sur la ligne d'origine à la fermeture.
  Pour ce dernier point, on ferme toujours via dialog.close() (croix, fond, Échap) avant que React
  retire le panneau : sinon le navigateur ne sait pas où rendre le focus.
*/
export function SidePanel({ labelledBy, onClose, children }: SidePanelProps) {
  // L'élément <dialog>, gardé en état (et non en ref) car la fonction « fermer » est passée au contenu
  const [dialog, setDialog] = useState<HTMLDialogElement | null>(null)
  const contentRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!dialog) return

    if (!dialog.open) dialog.showModal()
    // Focus sur le conteneur du panneau : il reste en place même quand le contenu passe du chargement à la fiche
    contentRef.current?.focus()
    // Empêche la page derrière de défiler pendant que le panneau est ouvert
    document.documentElement.style.overflow = 'hidden'

    return () => {
      document.documentElement.style.overflow = ''
    }
  }, [dialog])

  // Ferme le <dialog> (le navigateur rend le focus), puis prévient le parent tout de suite
  // sans attendre l'événement « close », que le navigateur peut retarder
  const close = useCallback(() => {
    dialog?.close()
    onClose()
  }, [dialog, onClose])

  return (
    <dialog
      ref={setDialog}
      aria-labelledby={labelledBy}
      // Déclenché par close() ou par Échap : on prévient le parent
      onClose={onClose}
      // Un clic sur le fond assombri touche le <dialog> lui-même, pas son contenu : on ferme
      onClick={(event) => event.target === event.currentTarget && close()}
      className="m-0 ml-auto h-dvh max-h-none w-full max-w-none bg-transparent p-0 backdrop:bg-black/60 sm:w-110"
    >
      <div ref={contentRef} tabIndex={-1} className="flex h-full flex-col border-l border-border bg-surface outline-none">
        {children(close)}
      </div>
    </dialog>
  )
}
