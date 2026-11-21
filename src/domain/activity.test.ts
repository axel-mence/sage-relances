import { describe, expect, it } from 'vitest'
import { activiteClient, grouperParJour, mailsEnvoyes } from './activity'
import type { Client, Relance } from './types'

const NOW = new Date('2026-11-20T12:00:00')

function relance(id: string, date: string): Relance {
  return { id, date, par: 'Claire Lemoine', pieces: ['p3'], canal: 'mail', mode: 'manuelle', objet: 'Objet', message: 'Message' }
}

// Dossier de novembre : 2 pièces reçues, 1 manquante, 2 relances
const client: Client = {
  id: 'x',
  nom: 'Garage Peyrot',
  contact: { nom: 'Marc Peyrot', email: 'marc@garage-peyrot.fr' },
  collaborateurId: 'c2',
  regimeTva: 'mensuelle',
  clientDepuis: '2021-09-01',
  echeance: '2026-11-16',
  pieces: [
    { id: 'p1', libelle: 'Relevé bancaire octobre', statut: 'recue', recueLe: '2026-11-20' },
    { id: 'p2', libelle: "Factures d'achat octobre", statut: 'recue', recueLe: '2026-11-12' },
    { id: 'p3', libelle: 'Notes de frais octobre', statut: 'manquante' },
  ],
  relances: [relance('r1', '2026-11-10T09:00:00'), relance('r2', '2026-11-19T15:30:00')],
}

describe('activiteClient', () => {
  it('réunit ouverture du dossier, pièces reçues et relances, du plus récent au plus ancien', () => {
    const resume = activiteClient(client).map((e) => `${e.type} ${e.date}`)
    expect(resume).toEqual([
      'piece_recue 2026-11-20',
      'relance 2026-11-19T15:30:00',
      'piece_recue 2026-11-12',
      'relance 2026-11-10T09:00:00',
      'ouverture 2026-11-01',
    ])
  })

  it('ouvre le dossier le 1er du mois de l’échéance, avec le nombre de pièces attendues', () => {
    expect(activiteClient(client).at(-1)).toEqual({ type: 'ouverture', date: '2026-11-01', nbPieces: 3 })
  })

  it('ignore les pièces manquantes', () => {
    const pieces = activiteClient(client).filter((e) => e.type === 'piece_recue')
    expect(pieces).toHaveLength(2)
  })

  it('ne garde que les relances pour l’onglet « Mails envoyés »', () => {
    expect(mailsEnvoyes(client).map((e) => e.date)).toEqual(['2026-11-19T15:30:00', '2026-11-10T09:00:00'])
  })
})

describe('grouperParJour', () => {
  it('groupe par jour avec « Aujourd’hui », « Hier » puis la date', () => {
    const jours = grouperParJour(activiteClient(client), NOW)
    expect(jours.map((j) => [j.libelle, j.evenements.length])).toEqual([
      ["Aujourd'hui", 1],
      ['Hier', 1],
      ['12 novembre', 1],
      ['10 novembre', 1],
      ['1er novembre', 1],
    ])
  })

  it('renvoie une liste vide sans événement', () => {
    expect(grouperParJour([], NOW)).toEqual([])
  })
})
