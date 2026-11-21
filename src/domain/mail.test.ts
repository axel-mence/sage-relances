import { describe, expect, it } from 'vitest'
import { composeRelance } from './mail'
import type { Client } from './types'

const NOW = new Date('2026-11-20T12:00:00')
const SIGNATURE = { collaborateur: 'Karim Benali', cabinet: 'Cabinet Lemoine' }

// Client de test : 1 pièce reçue, 2 manquantes, échéance future
function makeClient(overrides: Partial<Client> = {}): Client {
  return {
    id: 'x',
    nom: 'Garage Peyrot',
    contact: { nom: 'Marc Peyrot', email: 'marc@garage-peyrot.fr' },
    collaborateurId: 'c2',
    regimeTva: 'mensuelle',
    echeance: '2026-11-25',
    pieces: [
      { id: 'p1', libelle: 'Relevé bancaire octobre', statut: 'recue', recueLe: '2026-11-10' },
      { id: 'p2', libelle: 'Factures de vente octobre', statut: 'manquante' },
      { id: 'p3', libelle: 'Notes de frais octobre', statut: 'manquante' },
    ],
    relances: [],
    ...overrides,
  }
}

describe('composeRelance', () => {
  it('adresse le mail au contact du client, avec la période dans l’objet', () => {
    const mail = composeRelance(makeClient(), NOW, SIGNATURE)
    expect(mail.destinataire).toBe('Marc Peyrot <marc@garage-peyrot.fr>')
    expect(mail.objet).toBe('Pièces manquantes · TVA octobre 2026')
  })

  it('liste uniquement les pièces manquantes et signe au nom du collaborateur', () => {
    const { message } = composeRelance(makeClient(), NOW, SIGNATURE)
    expect(message).toContain('Bonjour Marc,')
    expect(message).toContain('déclaration de TVA d\'octobre 2026')
    expect(message).toContain('il nous manque encore 2 pièces')
    expect(message).toContain('- Factures de vente octobre')
    expect(message).toContain('- Notes de frais octobre')
    expect(message).not.toContain('Relevé bancaire')
    expect(message).toMatch(/Karim Benali\nCabinet Lemoine$/)
  })

  it('demande les pièces avant l’échéance si elle n’est pas passée', () => {
    const { message } = composeRelance(makeClient(), NOW, SIGNATURE)
    expect(message).toContain('avant le 25 novembre')
  })

  it('demande les pièces au plus vite si l’échéance est dépassée', () => {
    const { message } = composeRelance(makeClient({ echeance: '2026-11-16' }), NOW, SIGNATURE)
    expect(message).toContain("L'échéance du 16 novembre est dépassée")
    expect(message).toContain('au plus vite')
  })

  it('accorde au singulier quand une seule pièce manque', () => {
    const client = makeClient()
    client.pieces[2] = { ...client.pieces[2], statut: 'recue', recueLe: '2026-11-18' }
    const { message } = composeRelance(client, NOW, SIGNATURE)
    expect(message).toContain('il nous manque encore une pièce')
    expect(message).toContain('nous la transmettre')
    expect(message).toContain('le document en pièce jointe')
  })
})
