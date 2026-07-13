function mockScriptInjection(onAppend: (script: Partial<HTMLScriptElement>) => void) {
  const mockScript: Partial<HTMLScriptElement> = {}
  vi.spyOn(document, 'createElement').mockReturnValue(mockScript as HTMLScriptElement)
  vi.spyOn(document.head, 'appendChild').mockImplementation(() => {
    onAppend(mockScript)
    return mockScript as Node
  })
  return mockScript
}

// 8 (header) + 8 * 120 (Mat[8], each char[64] + 7 doubles) + 8 * 8 (mass_ratio[8])
const CATHODE_BYTES = 1032
const RESULT_BYTES = 88

const sampleMaterial = {
  name: 'LiFePO4',
  electronicConductivity: 1e-9,
  liIonConductivity: 1e-5,
  grainSize: 1.0,
  molecularWeight: 157.76,
  density: 3.6,
  reductionPotential: 3.4,
  valency: 1,
  massRatio: 60,
}

function createMockModule() {
  const buffer = new ArrayBuffer(4096)
  const HEAPU8 = new Uint8Array(buffer)
  const HEAP32 = new Int32Array(buffer)
  const HEAPF64 = new Float64Array(buffer)
  let nextPtr = 16
  const _malloc = vi.fn((size: number) => {
    const ptr = nextPtr
    nextPtr += size
    return ptr
  })
  const _free = vi.fn()
  const ccall = vi.fn((_name, _returnType, _argTypes, args) => {
    const resultPtr = Number(args[1])
    const offset = resultPtr / Float64Array.BYTES_PER_ELEMENT
    HEAPF64[offset] = 123.45
    HEAPF64[offset + 1] = 120.0
    HEAPF64.set([90, 80, 70, 60, 50, 40, 30, 20], offset + 2)
    HEAPF64[offset + 10] = 75.0
  })

  return { HEAPU8, HEAP32, HEAPF64, _malloc, _free, ccall }
}

describe('wasm util', () => {
  afterEach(() => {
    vi.restoreAllMocks()
    vi.resetModules()
    delete window.createCalculatorModule
  })

  it('loads calculator script on first call', async () => {
    const { calculate } = await import('./wasm')
    const module = createMockModule()
    window.createCalculatorModule = vi.fn().mockResolvedValue(module)

    const result = await calculate([sampleMaterial])

    expect(window.createCalculatorModule).toHaveBeenCalledTimes(1)
    expect(module._malloc).toHaveBeenNthCalledWith(1, CATHODE_BYTES)
    expect(module._malloc).toHaveBeenNthCalledWith(2, RESULT_BYTES)
    expect(module.ccall).toHaveBeenCalledWith(
      'calculate',
      null,
      ['number', 'number'],
      [16, 16 + CATHODE_BYTES]
    )
    expect(module._free).toHaveBeenNthCalledWith(1, 16)
    expect(module._free).toHaveBeenNthCalledWith(2, 16 + CATHODE_BYTES)
    expect(result).toEqual({
      am_capacity: 123.45,
      overall_cathode_capacity: 120,
      material_utilization: [90, 80, 70, 60, 50, 40, 30, 20],
      overall_cathode_utilization: 75,
    })
  })

  it('writes the cathode struct (N_mat, name, and properties) into wasm memory', async () => {
    const { calculate } = await import('./wasm')
    const module = createMockModule()
    window.createCalculatorModule = vi.fn().mockResolvedValue(module)

    await calculate([sampleMaterial])

    const cathodePtr = 16
    expect(module.HEAP32[cathodePtr / 4]).toBe(1)

    const matPtr = cathodePtr + 8
    const name = new TextDecoder()
      .decode(module.HEAPU8.subarray(matPtr, matPtr + 64))
      .replace(/\0.*$/, '')
    expect(name).toBe('LiFePO4')

    const doubleOffset = (matPtr + 64) / 8
    expect(module.HEAPF64[doubleOffset]).toBe(sampleMaterial.electronicConductivity)
    expect(module.HEAPF64[doubleOffset + 1]).toBe(sampleMaterial.liIonConductivity)
    expect(module.HEAPF64[doubleOffset + 2]).toBe(sampleMaterial.grainSize)
    expect(module.HEAPF64[doubleOffset + 3]).toBe(sampleMaterial.molecularWeight)
    expect(module.HEAPF64[doubleOffset + 4]).toBe(sampleMaterial.density)
    expect(module.HEAPF64[doubleOffset + 5]).toBe(sampleMaterial.reductionPotential)
    expect(module.HEAPF64[doubleOffset + 6]).toBe(sampleMaterial.valency)

    // mass_ratio[8] follows Mat[8]: header (8) + 8 materials * 120 bytes
    const massRatioBase = cathodePtr + 8 + 8 * 120
    expect(module.HEAPF64[massRatioBase / 8]).toBe(sampleMaterial.massRatio)
  })

  it('rejects cathodes with no materials or more than 8 materials', async () => {
    const { calculate } = await import('./wasm')
    const module = createMockModule()
    window.createCalculatorModule = vi.fn().mockResolvedValue(module)

    await expect(calculate([])).rejects.toThrow('Cathode must have between 1 and 8 materials')
    await expect(calculate(new Array(9).fill(sampleMaterial))).rejects.toThrow(
      'Cathode must have between 1 and 8 materials'
    )
  })

  it('reuses module on subsequent calls', async () => {
    const { calculate } = await import('./wasm')
    const module = createMockModule()
    window.createCalculatorModule = vi.fn().mockResolvedValue(module)

    await calculate([sampleMaterial])
    await calculate([sampleMaterial])
    expect(window.createCalculatorModule).toHaveBeenCalledTimes(1)
    expect(module.ccall).toHaveBeenCalledTimes(2)
  })

  it('injects a script when createCalculatorModule is not on window', async () => {
    const module = createMockModule()
    const mockScript = mockScriptInjection((script) => {
      window.createCalculatorModule = vi.fn().mockResolvedValue(module)
      script.onload!.call(script as GlobalEventHandlers, new Event('load'))
    })

    const { calculate } = await import('./wasm')
    const result = await calculate([sampleMaterial])

    expect(document.createElement).toHaveBeenCalledWith('script')
    expect(mockScript.src).toContain('calculator.js')
    expect(result.am_capacity).toBe(123.45)
  })

  it('throws when calculator script fails to load', async () => {
    mockScriptInjection((script) => {
      script.onerror!.call(script as GlobalEventHandlers, new Event('error'))
    })

    const { calculate } = await import('./wasm')
    await expect(calculate([sampleMaterial])).rejects.toThrow('Failed to load calculator.js')
  })
})
