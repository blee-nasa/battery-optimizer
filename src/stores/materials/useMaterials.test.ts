import { renderHook, act } from '@testing-library/react'
import { useMaterials } from './useMaterials'
import { clearMaterials } from './materials'
import type { Material } from '@types'

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

describe('useMaterials', () => {
  beforeEach(() => {
    clearMaterials()
  })

  it('starts with empty materials when store is cleared', () => {
    const { result } = renderHook(() => useMaterials())
    expect(result.current.materials).toEqual([])
  })

  it('adds a material and updates state', () => {
    const { result } = renderHook(() => useMaterials())
    act(() => {
      result.current.add(sampleMaterial)
    })
    expect(result.current.materials).toHaveLength(1)
    expect(result.current.materials[0].name).toBe('LiFePO4')
  })

  it('updates a material and reflects in state', () => {
    const { result } = renderHook(() => useMaterials())
    let id: string
    act(() => {
      id = result.current.add(sampleMaterial).id
    })
    act(() => {
      result.current.update(id, { name: 'LiCoO2' })
    })
    expect(result.current.materials[0].name).toBe('LiCoO2')
  })

  it('removes a material and reflects in state', () => {
    const { result } = renderHook(() => useMaterials())
    let id: string
    act(() => {
      id = result.current.add(sampleMaterial).id
    })
    act(() => {
      result.current.remove(id)
    })
    expect(result.current.materials).toHaveLength(0)
  })
})
