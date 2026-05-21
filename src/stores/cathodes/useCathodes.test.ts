import { renderHook, act } from '@testing-library/react'
import { useCathodes } from './useCathodes'
import { clearCathodes } from './cathodes'
import type { Cathode } from '@types'

const sampleCathode: Omit<Cathode, 'id'> = {
  name: 'Test Cathode',
  components: [
    { materialId: 'mat-1', massPercent: 80 },
  ],
}

describe('useCathodes', () => {
  beforeEach(() => {
    clearCathodes()
  })

  it('starts with empty cathodes when store is cleared', () => {
    const { result } = renderHook(() => useCathodes())
    expect(result.current.cathodes).toEqual([])
  })

  it('adds a cathode and updates state', () => {
    const { result } = renderHook(() => useCathodes())
    act(() => {
      result.current.add(sampleCathode)
    })
    expect(result.current.cathodes).toHaveLength(1)
    expect(result.current.cathodes[0].name).toBe('Test Cathode')
  })

  it('updates a cathode and reflects in state', () => {
    const { result } = renderHook(() => useCathodes())
    let id: string
    act(() => {
      id = result.current.add(sampleCathode).id
    })
    act(() => {
      result.current.update(id, { name: 'Updated' })
    })
    expect(result.current.cathodes[0].name).toBe('Updated')
  })

  it('removes a cathode and reflects in state', () => {
    const { result } = renderHook(() => useCathodes())
    let id: string
    act(() => {
      id = result.current.add(sampleCathode).id
    })
    act(() => {
      result.current.remove(id)
    })
    expect(result.current.cathodes).toHaveLength(0)
  })
})
