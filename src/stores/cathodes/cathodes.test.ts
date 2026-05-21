import type { Cathode } from '@types'
import {
  getCathodes,
  getCathode,
  addCathode,
  updateCathode,
  deleteCathode,
  clearCathodes,
  exportCathodes,
  importCathodes,
} from './cathodes'
import { seedCathodes } from './seed'

const sampleCathode: Omit<Cathode, 'id'> = {
  name: 'Test Cathode',
  components: [
    { materialId: 'mat-1', massPercent: 70 },
    { materialId: 'mat-2', massPercent: 30 },
  ],
}

describe('cathodes store', () => {
  afterEach(() => {
    clearCathodes()
  })

  it('seeds default cathodes on first load', () => {
    expect(seedCathodes.length).toBeGreaterThan(0)
    seedCathodes.forEach((c) => {
      expect(c.id).toBeDefined()
      expect(c.name).toBeDefined()
      expect(c.components.length).toBeGreaterThan(0)
    })
  })

  it('adds a cathode with a generated id', () => {
    const cathode = addCathode(sampleCathode)
    expect(cathode.id).toBeDefined()
    expect(cathode.name).toBe('Test Cathode')
    expect(getCathodes()).toHaveLength(1)
  })

  it('persists cathodes to localStorage', () => {
    addCathode(sampleCathode)
    const stored = JSON.parse(localStorage.getItem('cathodes')!)
    expect(stored).toHaveLength(1)
    expect(stored[0].name).toBe('Test Cathode')
  })

  it('gets a cathode by id', () => {
    const cathode = addCathode(sampleCathode)
    expect(getCathode(cathode.id)).toEqual(cathode)
  })

  it('returns undefined for unknown id', () => {
    expect(getCathode('nonexistent')).toBeUndefined()
  })

  it('updates a cathode', () => {
    const cathode = addCathode(sampleCathode)
    const updated = updateCathode(cathode.id, { name: 'Renamed' })
    expect(updated.name).toBe('Renamed')
    expect(updated.components).toEqual(sampleCathode.components)
  })

  it('throws when updating a nonexistent cathode', () => {
    expect(() => updateCathode('nonexistent', { name: 'X' })).toThrow('Cathode not found')
  })

  it('deletes a cathode', () => {
    const cathode = addCathode(sampleCathode)
    deleteCathode(cathode.id)
    expect(getCathodes()).toHaveLength(0)
  })

  it('throws when deleting a nonexistent cathode', () => {
    expect(() => deleteCathode('nonexistent')).toThrow('Cathode not found')
  })

  it('exports cathodes as JSON', () => {
    addCathode(sampleCathode)
    const json = exportCathodes()
    const parsed = JSON.parse(json)
    expect(parsed).toHaveLength(1)
    expect(parsed[0].name).toBe('Test Cathode')
  })

  it('imports cathodes from JSON', () => {
    const data = [{ ...sampleCathode, id: 'import-1' }]
    const result = importCathodes(JSON.stringify(data))
    expect(result).toHaveLength(1)
    expect(getCathodes()[0].name).toBe('Test Cathode')
  })

  it('throws on invalid import JSON', () => {
    expect(() => importCathodes('{"not":"an array"}')).toThrow('Invalid format')
  })
})
