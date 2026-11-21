import { describe, expect, it } from 'vitest'
import { voisins } from './voisins'

const LISTE = ['garage-peyrot', 'pharmacie-du-marche', 'taxi-moreau']

describe('voisins', () => {
  it('donne la position et les 2 voisins d’un client au milieu de la liste', () => {
    expect(voisins(LISTE, 'pharmacie-du-marche')).toEqual({
      position: 2,
      total: 3,
      precedent: 'garage-peyrot',
      suivant: 'taxi-moreau',
    })
  })

  it('n’a pas de précédent pour le premier, ni de suivant pour le dernier', () => {
    expect(voisins(LISTE, 'garage-peyrot')?.precedent).toBeUndefined()
    expect(voisins(LISTE, 'taxi-moreau')?.suivant).toBeUndefined()
  })

  it('renvoie undefined pour un client absent de la liste', () => {
    expect(voisins(LISTE, 'inconnu')).toBeUndefined()
  })
})
