import { useCallback, useState } from 'react'
import type { Material } from '@types'
import * as store from './materials'

export const useMaterials = () => {
  const [materials, setMaterials] = useState<Material[]>(store.getMaterials)

  const refresh = useCallback(() => {
    setMaterials(store.getMaterials())
  }, [])

  const add = useCallback((material: Omit<Material, 'id'>) => {
    const created = store.addMaterial(material)
    refresh()
    return created
  }, [refresh])

  const update = useCallback((id: string, updates: Partial<Omit<Material, 'id'>>) => {
    const updated = store.updateMaterial(id, updates)
    refresh()
    return updated
  }, [refresh])

  const remove = useCallback((id: string) => {
    store.deleteMaterial(id)
    refresh()
  }, [refresh])

  const reset = useCallback(() => {
    store.resetMaterials()
    refresh()
  }, [refresh])

  const exportJSON = useCallback(() => {
    return store.exportMaterials()
  }, [])

  const importJSON = useCallback((json: string) => {
    store.importMaterials(json)
    refresh()
  }, [refresh])

  return { materials, add, update, remove, reset, exportJSON, importJSON }
}
