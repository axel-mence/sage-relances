import { useState } from 'react'
import type { StatusFilter } from '../domain/filters'
import type { DossierStatus } from '../domain/types'

/*
  Barre de répartition des dossiers par statut (note N2, DS v2).
  Une seule barre en dégradé : chaque statut occupe une part proportionnelle à son nombre de dossiers,
  avec un fondu entre deux segments. Des boutons invisibles posés par-dessus rendent chaque segment
  survolable (info-bulle), cliquable (filtre la liste) et accessible au clavier.
*/

// Ordre de gauche à droite : du vert (à jour) au rouge (en retard)
const SEGMENTS: { status: DossierStatus; label: string; color: string }[] = [
  { status: 'complet', label: 'Complets', color: 'var(--color-gradient-retard-start)' },
  // Noir du DS à 40 % (spec DS v2)
  { status: 'relancee', label: 'Relancés', color: 'color-mix(in srgb, var(--color-primary) 40%, var(--color-surface))' },
  { status: 'en_attente', label: 'En attente', color: 'var(--color-gradient-retard-mid)' },
  { status: 'en_retard', label: 'En retard', color: 'var(--color-gradient-retard-end)' },
]

// Largeur du fondu entre deux segments, en % de la barre (réduite si le segment est étroit)
const FONDU = 3

type DistributionBarProps = {
  counts: Record<DossierStatus, number>
  // Filtre actif de la liste : sa pastille est mise en évidence
  active: StatusFilter
  // Recliquer sur la pastille active revient à « Tous »
  onSelect: (filter: StatusFilter) => void
}

export function DistributionBar({ counts, active, onSelect }: DistributionBarProps) {
  // Segment survolé ou sélectionné au clavier (affiche son info-bulle)
  const [hovered, setHovered] = useState<DossierStatus>()
  const total = SEGMENTS.reduce((sum, s) => sum + counts[s.status], 0)

  // Position (début, largeur) de chaque segment en %
  const widths = SEGMENTS.map((segment) => (total ? (counts[segment.status] / total) * 100 : 0))
  const parts = SEGMENTS.map((segment, index) => ({
    ...segment,
    count: counts[segment.status],
    // Le segment commence là où s'arrêtent tous ceux d'avant
    start: widths.slice(0, index).reduce((sum, w) => sum + w, 0),
    width: widths[index],
  })).filter((part) => part.count > 0)

  // Dégradé CSS : chaque couleur est pleine au centre de son segment et se fond dans la voisine aux frontières
  const stops = parts.flatMap((part, index) => {
    const fondu = Math.min(FONDU, part.width / 3)
    const from = index === 0 ? part.start : part.start + fondu
    const to = index === parts.length - 1 ? part.start + part.width : part.start + part.width - fondu
    return [`${part.color} ${from}%`, `${part.color} ${to}%`]
  })
  const background = stops.length ? `linear-gradient(to right, ${stops.join(', ')})` : undefined

  const pourcentage = (count: number) => Math.round((count / total) * 100)

  return (
    <section aria-labelledby="distribution-title" className="flex flex-col gap-3">
      <div className="flex items-baseline justify-between gap-4">
        <h2 id="distribution-title" className="text-label text-secondary">Répartition des dossiers</h2>
        <span className="text-caption text-secondary tabular-nums">{total} dossiers</span>
      </div>

      {/* Zone cliquable plus haute que la barre (24 px) pour viser facilement les petits segments */}
      <div className="relative h-6">
        <div aria-hidden="true" className="absolute inset-x-0 top-2 h-2 rounded-full bg-border" style={{ background }} />

        {parts.map((part) => {
          const centre = part.start + part.width / 2
          // Info-bulle alignée sur le segment, sans déborder sur les bords de l'écran
          const bulle = centre < 15 ? 'left-0' : centre > 85 ? 'right-0' : '-translate-x-1/2'
          return (
            <button
              key={part.status}
              type="button"
              onClick={() => onSelect(part.status)}
              onMouseEnter={() => setHovered(part.status)}
              onMouseLeave={() => setHovered(undefined)}
              onFocus={() => setHovered(part.status)}
              onBlur={() => setHovered(undefined)}
              aria-label={`${part.label} : ${part.count} dossiers, ${pourcentage(part.count)} %. Afficher ces dossiers`}
              className="absolute inset-y-0 cursor-pointer rounded-full"
              style={{ left: `${part.start}%`, width: `${part.width}%` }}
            >
              {hovered === part.status && (
                <span
                  aria-hidden="true"
                  className={`pointer-events-none absolute bottom-full mb-1 rounded-md bg-primary px-2 py-1 text-caption whitespace-nowrap text-white tabular-nums ${bulle}`}
                  style={bulle === '-translate-x-1/2' ? { left: '50%' } : undefined}
                >
                  {part.label} · {part.count} ({pourcentage(part.count)} %)
                </span>
              )}
            </button>
          )
        })}
      </div>

      {/* Légende en pastilles cliquables : filtre la liste sur l'état choisi */}
      <ul className="flex flex-wrap gap-2" aria-label="Filtrer la liste par état">
        {SEGMENTS.map((segment) => {
          const selected = active === segment.status
          return (
            <li key={segment.status}>
              <button
                type="button"
                aria-pressed={selected}
                onClick={() => onSelect(selected ? 'tous' : segment.status)}
                className={`flex h-8 cursor-pointer items-center gap-2 rounded-full border px-3 text-label transition-colors ${
                  selected
                    ? 'border-primary bg-primary text-white'
                    : 'border-border bg-surface text-secondary hover:border-primary hover:text-primary'
                }`}
              >
                <span aria-hidden="true" className="size-2 rounded-full" style={{ background: segment.color }} />
                {segment.label}
                <span className={`tabular-nums ${selected ? 'text-white' : 'text-primary'}`}>{counts[segment.status]}</span>
              </button>
            </li>
          )
        })}
      </ul>
    </section>
  )
}
