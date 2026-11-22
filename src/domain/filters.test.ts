import { describe, expect, it } from 'vitest'
import { parColonne, triSuivant } from './filters'
import type { ClientView } from './types'

// Client minimal pour le tri : statut, pièces reçues / attendues
function client(nom: string, statut: ClientView['statut'], recues: number, total: number): ClientView {
  return {
    id: nom,
    slug: nom,
    nom,
    contact: { nom: 'x', email: 'x@x.fr' },
    collaborateurId: 'c1',
    collaborateur: 'x',
    regimeTva: 'mensuelle',
    clientDepuis: '2020-01-01',
    echeance: '2026-11-25',
    statut,
    nbManquantes: total - recues,
    relances: [],
    pieces: Array.from({ length: total }, (_, i) => ({
      id: `${nom}-${i}`,
      libelle: 'Pièce',
      statut: i < recues ? ('recue' as const) : ('manquante' as const),
    })),
  }
}

const A = client('a', 'en_attente', 3, 4) // 75 %, 1 manquante
const B = client('b', 'en_retard', 1, 4) // 25 %, 3 manquantes
const C = client('c', 'en_retard', 3, 4) // 75 %, 1 manquante

describe('tri par colonne', () => {
  it('trie par complétude décroissante, la gravité départageant les égalités', () => {
    expect([A, B, C].sort(parColonne({ cle: 'completude', sens: 'desc' })).map((c) => c.nom)).toEqual(['c', 'a', 'b'])
  })

  it('trie par nombre de pièces manquantes croissant', () => {
    expect([B, A, C].sort(parColonne({ cle: 'pieces', sens: 'asc' })).map((c) => c.nom)).toEqual(['c', 'a', 'b'])
  })

  it('passe de décroissant à croissant, puis revient au tri par gravité', () => {
    const t1 = triSuivant(undefined, 'pieces')
    const t2 = triSuivant(t1, 'pieces')
    expect(t1).toEqual({ cle: 'pieces', sens: 'desc' })
    expect(t2).toEqual({ cle: 'pieces', sens: 'asc' })
    expect(triSuivant(t2, 'pieces')).toBeUndefined()
    expect(triSuivant(t2, 'completude')).toEqual({ cle: 'completude', sens: 'desc' })
  })
})
