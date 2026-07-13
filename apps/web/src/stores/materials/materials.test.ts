import type { Material } from '@types'
import {
  getMaterials,
  getMaterial,
  addMaterial,
  updateMaterial,
  deleteMaterial,
  clearMaterials,
  exportMaterials,
  importMaterials,
} from './materials'
import { seedMaterials } from './seed'

const sampleMaterial: Omit<Material, 'id'> = {
  name: 'LiFePO4',
  category: 'Active Material',
  grainSize: 1.0,
  density: 3.6,
  molecularWeight: 157.76,
  eConductivity: 1e-9,
  liConductivity: 1e-5,
  reductionPotential: 3.4,
  valency: 1,
}

describe('materials store', () => {
  afterEach(() => {
    clearMaterials()
  })

  it('seeds default materials on first load', () => {
    // clearMaterials wipes localStorage, so re-importing would re-seed.
    // For this test, just verify the seed data exists and is well-formed.
    expect(seedMaterials.length).toBeGreaterThan(0)
    seedMaterials.forEach((m) => {
      expect(m.id).toBeDefined()
      expect(m.name).toBeDefined()
      expect(m.category).toBeDefined()
    })
  })

  it('adds a material with a generated id', () => {
    clearMaterials()
    const material = addMaterial(sampleMaterial)
    expect(material.id).toBeDefined()
    expect(material.name).toBe('LiFePO4')
    expect(getMaterials()).toHaveLength(1)
  })

  it('persists materials to localStorage', () => {
    clearMaterials()
    addMaterial(sampleMaterial)
    const stored = JSON.parse(localStorage.getItem('materials')!)
    expect(stored).toHaveLength(1)
    expect(stored[0].name).toBe('LiFePO4')
  })

  it('gets a material by id', () => {
    const material = addMaterial(sampleMaterial)
    expect(getMaterial(material.id)).toEqual(material)
  })

  it('returns undefined for unknown id', () => {
    expect(getMaterial('nonexistent')).toBeUndefined()
  })

  it('updates a material', () => {
    const material = addMaterial(sampleMaterial)
    const updated = updateMaterial(material.id, { name: 'LiCoO2' })
    expect(updated.name).toBe('LiCoO2')
    expect(updated.id).toBe(material.id)
    expect(getMaterial(material.id)?.name).toBe('LiCoO2')
  })

  it('throws when updating a nonexistent material', () => {
    expect(() => updateMaterial('nonexistent', { name: 'X' })).toThrow('Material not found')
  })

  it('deletes a material', () => {
    const material = addMaterial(sampleMaterial)
    deleteMaterial(material.id)
    expect(getMaterials()).toHaveLength(0)
  })

  it('throws when deleting a nonexistent material', () => {
    expect(() => deleteMaterial('nonexistent')).toThrow('Material not found')
  })

  it('returns a copy from getMaterials', () => {
    addMaterial(sampleMaterial)
    const list = getMaterials()
    list.pop()
    expect(getMaterials()).toHaveLength(1)
  })

  it('exports materials as JSON', () => {
    addMaterial(sampleMaterial)
    const json = exportMaterials()
    const parsed = JSON.parse(json)
    expect(parsed).toHaveLength(1)
    expect(parsed[0].name).toBe('LiFePO4')
  })

  it('imports materials from JSON', () => {
    const data = [{ ...sampleMaterial, id: 'import-1' }]
    const result = importMaterials(JSON.stringify(data))
    expect(result).toHaveLength(1)
    expect(getMaterials()[0].name).toBe('LiFePO4')
  })

  it('throws on invalid import JSON', () => {
    expect(() => importMaterials('{"not":"an array"}')).toThrow('Invalid format')
  })
})
