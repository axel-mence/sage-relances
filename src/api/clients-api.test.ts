import { describe, expect, it } from 'vitest'
import { ApiError, createApi } from './clients-api'

// Date de référence du jeu de données, à midi : aucun décalage de dates
const NOW = new Date('2026-11-20T12:00:00')

// API sans latence ni échec, pour des tests rapides et prévisibles
function testApi(now = NOW, failRate = 0) {
  return createApi({ now: () => now, latency: [0, 0], failRate: () => failRate })
}

describe('API simulée', () => {
  it('répartit les 24 clients comme prévu dans la spec', async () => {
    const clients = await testApi().getClients()
    const compte = (statut: string) => clients.filter((c) => c.statut === statut).length

    expect(clients).toHaveLength(24)
    expect(compte('en_retard')).toBe(6)
    expect(compte('en_attente')).toBe(7)
    expect(compte('relancee')).toBe(3)
    expect(compte('complet')).toBe(8)
  })

  it('filtre par statut', async () => {
    const enRetard = await testApi().getClients('en_retard')
    expect(enRetard).toHaveLength(6)
    expect(enRetard.every((c) => c.statut === 'en_retard')).toBe(true)
  })

  it('trie par échéance puis par nombre de pièces manquantes', async () => {
    const clients = await testApi().getClients()
    for (let i = 1; i < clients.length; i++) {
      const prev = clients[i - 1]
      const cur = clients[i]
      const ordreOk = prev.echeance < cur.echeance || (prev.echeance === cur.echeance && prev.nbManquantes >= cur.nbManquantes)
      expect(ordreOk).toBe(true)
    }
  })

  it('calcule les KPI à l’échelle du cabinet (180 dossiers)', async () => {
    const kpis = await testApi().getKpis()
    expect(kpis).toEqual({
      dossiersComplets: 60, // 8 × 7,5
      totalDossiers: 180,
      enRetard: 45, // 6 × 7,5
      relancesSemaine: 38, // 5 relances sur 7 jours × 7,5, arrondi
      tempsGagneMinutes: 380,
    })
  })

  it('enregistre une relance : statut « relancee » et événement ajouté', async () => {
    const api = testApi()
    const [client] = await api.getClients('en_retard')
    const apres = await api.postRelance(client.id)

    expect(apres.statut).toBe('relancee')
    expect(apres.relances).toHaveLength(client.relances.length + 1)
    expect(apres.derniereRelance).toBe(NOW.toISOString())
    expect(apres.nbManquantes).toBe(client.nbManquantes)

    // La relance est bien conservée côté « serveur »
    const relu = await api.getClient(client.id)
    expect(relu.statut).toBe('relancee')
  })

  it('enregistre le texte retouché de la relance, sinon le mail par défaut', async () => {
    const api = testApi()
    const [a, b] = await api.getClients('en_retard')

    const retouche = await api.postRelance(a.id, { objet: 'Objet modifié', message: 'Message modifié' })
    expect(retouche.relances.at(-1)).toMatchObject({ objet: 'Objet modifié', message: 'Message modifié', mode: 'manuelle' })

    const parDefaut = await api.postRelance(b.id)
    expect(parDefaut.relances.at(-1)?.objet).toBe('Pièces manquantes · TVA octobre 2026')
  })

  it('reconstitue le mail des relances passées du jeu de données', async () => {
    const clients = await testApi().getClients()
    const relances = clients.flatMap((c) => c.relances)
    expect(relances.length).toBeGreaterThan(0)
    expect(relances.every((r) => r.objet.startsWith('Pièces manquantes') && r.message.startsWith('Bonjour'))).toBe(true)
  })

  it('refuse de relancer un dossier complet', async () => {
    const api = testApi()
    const [complet] = await api.getClients('complet')
    await expect(api.postRelance(complet.id)).rejects.toBeInstanceOf(ApiError)
  })

  it('échoue quand le taux d’échec vaut 1 (équivalent de ?fail=1)', async () => {
    await expect(testApi(NOW, 1).getClients()).rejects.toBeInstanceOf(ApiError)
  })

  it('décale les dates pour garder les mêmes statuts un autre jour', async () => {
    const plusTard = new Date('2027-02-03T12:00:00')
    const clients = await testApi(plusTard).getClients()
    expect(clients.filter((c) => c.statut === 'en_retard')).toHaveLength(6)
    expect(clients.filter((c) => c.statut === 'relancee')).toHaveLength(3)
  })
})
