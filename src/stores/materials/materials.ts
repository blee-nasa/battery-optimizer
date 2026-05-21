import type { Material } from '@types'
import { seedMaterials } from './seed'

const STORAGE_KEY = 'materials'
const SEEDED_KEY = 'materials-seeded'

const load = (): Material[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

const save = (data: Material[]): void => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
}

const init = (): Material[] => {
  const stored = load()
  if (stored.length > 0) return stored
  if (localStorage.getItem(SEEDED_KEY)) return []
  localStorage.setItem(SEEDED_KEY, '1')
  save(seedMaterials)
  return [...seedMaterials]
}

let materials: Material[] = init()

export const getMaterials = (): Material[] => {
  return [...materials]
}

export const getMaterial = (id: string): Material | undefined => {
  return materials.find((m) => m.id === id)
}

export const addMaterial = (material: Omit<Material, 'id'>): Material => {
  const newMaterial: Material = {
    ...material,
    id: crypto.randomUUID(),
  }
  materials = [...materials, newMaterial]
  save(materials)
  return newMaterial
}

export const updateMaterial = (id: string, updates: Partial<Omit<Material, 'id'>>): Material => {
  const index = materials.findIndex((m) => m.id === id)
  if (index === -1) {
    throw new Error(`Material not found: ${id}`)
  }
  const updated = { ...materials[index], ...updates }
  materials = materials.map((m) => (m.id === id ? updated : m))
  save(materials)
  return updated
}

export const deleteMaterial = (id: string): void => {
  const index = materials.findIndex((m) => m.id === id)
  if (index === -1) {
    throw new Error(`Material not found: ${id}`)
  }
  materials = materials.filter((m) => m.id !== id)
  save(materials)
}

export const clearMaterials = (): void => {
  materials = []
  save(materials)
  localStorage.removeItem(SEEDED_KEY)
}

export const resetMaterials = (): Material[] => {
  materials = [...seedMaterials]
  save(materials)
  localStorage.setItem(SEEDED_KEY, '1')
  return [...materials]
}

export const exportMaterials = (): string => {
  return JSON.stringify(materials, null, 2)
}

export const importMaterials = (json: string): Material[] => {
  const parsed = JSON.parse(json)
  if (!Array.isArray(parsed)) throw new Error('Invalid format: expected an array')
  materials = parsed as Material[]
  save(materials)
  return [...materials]
}
