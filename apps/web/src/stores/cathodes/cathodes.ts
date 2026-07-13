import type { Cathode } from '@types'
import { seedCathodes } from './seed'

const STORAGE_KEY = 'cathodes'
const SEEDED_KEY = 'cathodes-seeded'

const load = (): Cathode[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

const save = (data: Cathode[]): void => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
}

const init = (): Cathode[] => {
  const stored = load()
  if (stored.length > 0) return stored
  if (localStorage.getItem(SEEDED_KEY)) return []
  localStorage.setItem(SEEDED_KEY, '1')
  save(seedCathodes)
  return [...seedCathodes]
}

let cathodes: Cathode[] = init()

export const getCathodes = (): Cathode[] => {
  return [...cathodes]
}

export const getCathode = (id: string): Cathode | undefined => {
  return cathodes.find((c) => c.id === id)
}

export const addCathode = (cathode: Omit<Cathode, 'id'>): Cathode => {
  const newCathode: Cathode = {
    ...cathode,
    id: crypto.randomUUID(),
  }
  cathodes = [...cathodes, newCathode]
  save(cathodes)
  return newCathode
}

export const updateCathode = (id: string, updates: Partial<Omit<Cathode, 'id'>>): Cathode => {
  const index = cathodes.findIndex((c) => c.id === id)
  if (index === -1) throw new Error(`Cathode not found: ${id}`)
  const updated = { ...cathodes[index], ...updates }
  cathodes = cathodes.map((c) => (c.id === id ? updated : c))
  save(cathodes)
  return updated
}

export const deleteCathode = (id: string): void => {
  const index = cathodes.findIndex((c) => c.id === id)
  if (index === -1) throw new Error(`Cathode not found: ${id}`)
  cathodes = cathodes.filter((c) => c.id !== id)
  save(cathodes)
}

export const clearCathodes = (): void => {
  cathodes = []
  save(cathodes)
  localStorage.removeItem(SEEDED_KEY)
}

export const resetCathodes = (): Cathode[] => {
  cathodes = [...seedCathodes]
  save(cathodes)
  localStorage.setItem(SEEDED_KEY, '1')
  return [...cathodes]
}

export const exportCathodes = (): string => {
  return JSON.stringify(cathodes, null, 2)
}

export const importCathodes = (json: string): Cathode[] => {
  const parsed = JSON.parse(json)
  if (!Array.isArray(parsed)) throw new Error('Invalid format: expected an array')
  cathodes = parsed as Cathode[]
  save(cathodes)
  return [...cathodes]
}
