import { describe, expect, it } from 'vitest'
import clients from '../data/clients.json'
import { slugify } from './slug'

describe('slugify', () => {
  it('transforme un nom en adresse lisible, sans accent ni ponctuation', () => {
    expect(slugify('Garage Peyrot')).toBe('garage-peyrot')
    expect(slugify("Boulangerie Les Blés d'Or")).toBe('boulangerie-les-bles-d-or')
    expect(slugify('Fleurs & Sens')).toBe('fleurs-sens')
    expect(slugify('Électricité Bernard')).toBe('electricite-bernard')
  })

  it('donne une adresse différente à chacun des 24 clients', () => {
    const slugs = clients.clients.map((c) => slugify(c.nom))
    expect(new Set(slugs).size).toBe(slugs.length)
  })
})
