import { describe, expect, it } from 'vitest'
import { computeStatus, niveauCompletude, tauxCompletude } from './status'
import type { Client, Relance } from './types'

const NOW = new Date('2026-11-20T12:00:00')

// Fabrique un client de test : par défaut une pièce manquante, échéance future, aucune relance
function makeClient(overrides: Partial<Client> = {}): Client {
  return {
    id: 'x',
    nom: 'Client test',
    contact: { nom: 'Contact test', email: 'contact@test.fr' },
    collaborateurId: 'c1',
    regimeTva: 'mensuelle',
    clientDepuis: '2020-01-01',
    echeance: '2026-11-25',
    pieces: [
      { id: 'p1', libelle: 'Relevé bancaire', statut: 'recue', recueLe: '2026-11-10' },
      { id: 'p2', libelle: 'Factures', statut: 'manquante' },
    ],
    relances: [],
    ...overrides,
  }
}

function relanceIlYa(heures: number): Relance {
  return {
    id: 'r',
    date: new Date(NOW.getTime() - heures * 3600_000).toISOString(),
    par: 'Test',
    pieces: ['p2'],
    canal: 'mail',
    mode: 'manuelle',
    objet: 'Objet test',
    message: 'Message test',
  }
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

describe('tauxCompletude', () => {
  it('calcule la part de pièces reçues, arrondie', () => {
    expect(tauxCompletude(makeClient())).toBe(50) // 1 reçue sur 2
    const troisPieces = makeClient({
      pieces: [
        { id: 'a', libelle: 'A', statut: 'recue' },
        { id: 'b', libelle: 'B', statut: 'manquante' },
        { id: 'c', libelle: 'C', statut: 'manquante' },
      ],
    })
    expect(tauxCompletude(troisPieces)).toBe(33)
  })

  it('vaut 100 % quand tout est reçu ou qu’aucune pièce n’est attendue', () => {
    expect(tauxCompletude(makeClient({ pieces: [{ id: 'a', libelle: 'A', statut: 'recue' }] }))).toBe(100)
    expect(tauxCompletude(makeClient({ pieces: [] }))).toBe(100)
  })
})

describe('niveauCompletude', () => {
  it('passe du rouge au jaune à 50 %, puis au vert à 80 %', () => {
    expect(niveauCompletude(0)).toBe('faible')
    expect(niveauCompletude(49)).toBe('faible')
    expect(niveauCompletude(50)).toBe('moyen')
    expect(niveauCompletude(79)).toBe('moyen')
    expect(niveauCompletude(80)).toBe('bon')
    expect(niveauCompletude(100)).toBe('bon')
  })
})
