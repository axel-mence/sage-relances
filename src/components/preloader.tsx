import { useEffect, useRef, useState } from 'react'
import { NudgeLogo } from './nudge-logo'

// Grille de lames (CONTEXTE refs-auth : ~20 × 12)
const COLONNES = 20
const LIGNES = 12

// Décalage entre 2 diagonales de lames : c'est lui qui fait « avancer » la vague
const PAS_VAGUE_MS = 50

// Durée totale avant la sortie (la vague a traversé la grille), puis durée du fondu de sortie
const DUREE_MS = 2300
const SORTIE_MS = 500

// Mouvement réduit : pas de vague, simple fondu du logo, plus court
const DUREE_REDUIT_MS = 1200

type PreloaderProps = {
  // Appelé une fois la sortie terminée (la page suivante peut s'afficher)
  onDone?: () => void
}

/*
  Preloader au lancement (référence Squarespace « lames 3D en vague », validée par Axel).
  - Toujours en sombre : la classe theme-dark force les tokens du mode sombre, quel que soit le thème choisi.
  - Une grille de lames posées sur un plan incliné (CSS 3D : perspective + rotateX).
    Une vague diagonale les fait pivoter tour à tour ; leur tranche s'éclaire en citron au passage,
    puis revient au vert sombre (animation « lame-vague » dans index.css, délai propre à chaque lame).
  - Sortie : les lames sont à plat, le tout disparaît en fondu.
  - prefers-reduced-motion : la grille est masquée, il ne reste que la carte en fondu.
*/
export function Preloader({ onDone }: PreloaderProps) {
  const [sortie, setSortie] = useState(false)
  // Gardé dans une ref : un nouveau onDone à chaque rendu du parent ne relance pas les minuteurs
  const onDoneRef = useRef(onDone)
  useEffect(() => {
    onDoneRef.current = onDone
  }, [onDone])

  useEffect(() => {
    const reduit = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const duree = reduit ? DUREE_REDUIT_MS : DUREE_MS
    const debutSortie = window.setTimeout(() => setSortie(true), duree)
    const fin = window.setTimeout(() => onDoneRef.current?.(), duree + SORTIE_MS)
    return () => {
      window.clearTimeout(debutSortie)
      window.clearTimeout(fin)
    }
  }, [])

  return (
    <div
      role="status"
      aria-label="Préparation de votre cabinet"
      className={`theme-dark fixed inset-0 z-50 overflow-hidden bg-page transition-opacity duration-500 ${sortie ? 'opacity-0' : 'opacity-100'}`}
    >
      {/* Scène 3D : le plan de lames est incliné et agrandi pour remplir l'écran */}
      <div aria-hidden="true" className="absolute inset-0 grid place-items-center perspective-[1100px] motion-reduce:hidden">
        <div
          className="grid shrink-0 gap-x-3 transform-3d [transform:rotateX(56deg)_rotateZ(-32deg)_scale(1.9)]"
          style={{ gridTemplateColumns: `repeat(${COLONNES}, 3.75rem)` }}
        >
          {Array.from({ length: COLONNES * LIGNES }, (_, index) => {
            const colonne = index % COLONNES
            const ligne = Math.floor(index / COLONNES)
            return (
              <span
                key={index}
                className="preloader-lame"
                // Diagonale de la lame × pas : les lames d'une même diagonale pivotent ensemble
                style={{ animationDelay: `${(colonne + ligne) * PAS_VAGUE_MS}ms` }}
              />
            )
          })}
        </div>
      </div>

      {/* Voile du bas : la carte reste lisible au-dessus des lames */}
      <div aria-hidden="true" className="absolute inset-x-0 bottom-0 h-1/2 bg-linear-to-t from-page to-transparent" />

      {/* Carte claire en bas à gauche, qui tranche sur les lames : logo + message (référence Squarespace) */}
      <div className="absolute bottom-4 left-4 flex w-[calc(100%-2rem)] max-w-72 animate-[preloader-carte_600ms_ease-out_both] flex-col gap-10 rounded-sm bg-inverse p-6 sm:bottom-8 sm:left-8">
        <NudgeLogo className="h-6 text-on-inverse" />
        <p className="font-display text-section text-on-inverse">Préparation de votre cabinet…</p>
      </div>
    </div>
  )
}
