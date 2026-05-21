import { useCallback, useState } from 'react'
import type { Cathode } from '@types'
import * as store from './cathodes'

export const useCathodes = () => {
  const [cathodes, setCathodes] = useState<Cathode[]>(store.getCathodes)

  const refresh = useCallback(() => {
    setCathodes(store.getCathodes())
  }, [])

  const add = useCallback((cathode: Omit<Cathode, 'id'>) => {
    const created = store.addCathode(cathode)
    refresh()
    return created
  }, [refresh])

  const update = useCallback((id: string, updates: Partial<Omit<Cathode, 'id'>>) => {
    const updated = store.updateCathode(id, updates)
    refresh()
    return updated
  }, [refresh])

  const remove = useCallback((id: string) => {
    store.deleteCathode(id)
    refresh()
  }, [refresh])

  const exportJSON = useCallback(() => {
    return store.exportCathodes()
  }, [])

  const importJSON = useCallback((json: string) => {
    store.importCathodes(json)
    refresh()
  }, [refresh])

  const reset = useCallback(() => {
    store.resetCathodes()
    refresh()
  }, [refresh])

  return { cathodes, add, update, remove, exportJSON, importJSON, reset }
}
