import { describe, expect, it } from 'vitest'
import { computeStatus } from './status'
import type { Client } from './types'

const NOW = new Date('2026-11-20T12:00:00')

// Fabrique un client de test : par défaut une pièce manquante, échéance future, aucune relance
function makeClient(overrides: Partial<Client> = {}): Client {
  return {
    id: 'x',
    nom: 'Client test',
    collaborateurId: 'c1',
    regimeTva: 'mensuelle',
    echeance: '2026-11-25',
    pieces: [
      { id: 'p1', libelle: 'Relevé bancaire', statut: 'recue', recueLe: '2026-11-10' },
      { id: 'p2', libelle: 'Factures', statut: 'manquante' },
    ],
    relances: [],
    ...overrides,
  }
}

function relanceIlYa(heures: number) {
  return { id: 'r', date: new Date(NOW.getTime() - heures * 3600_000).toISOString(), par: 'Test', pieces: ['p2'], canal: 'mail' as const }
}

describe('computeStatus', () => {
  it('renvoie « complet » quand toutes les pièces sont reçues, même échéance dépassée', () => {
    const client = makeClient({
      echeance: '2026-11-01',
      pieces: [{ id: 'p1', libelle: 'Relevé', statut: 'recue' }],
    })
    expect(computeStatus(client, NOW)).toBe('complet')
  })

  it('renvoie « en_attente » avant l’échéance sans relance récente', () => {
    expect(computeStatus(makeClient(), NOW)).toBe('en_attente')
  })

  it('reste « en_attente » le jour même de l’échéance', () => {
    expect(computeStatus(makeClient({ echeance: '2026-11-20' }), NOW)).toBe('en_attente')
  })

  it('renvoie « en_retard » dès le lendemain de l’échéance', () => {
    expect(computeStatus(makeClient({ echeance: '2026-11-19' }), NOW)).toBe('en_retard')
  })

  it('renvoie « relancee » si la dernière relance date de moins de 3 jours', () => {
    expect(computeStatus(makeClient({ relances: [relanceIlYa(47)] }), NOW)).toBe('relancee')
  })

  it('fait passer un client en retard à « relancee » après une relance récente', () => {
    const client = makeClient({ echeance: '2026-11-15', relances: [relanceIlYa(1)] })
    expect(computeStatus(client, NOW)).toBe('relancee')
  })

  it('ignore une relance de plus de 3 jours', () => {
    const client = makeClient({ echeance: '2026-11-15', relances: [relanceIlYa(73)] })
    expect(computeStatus(client, NOW)).toBe('en_retard')
  })
})
