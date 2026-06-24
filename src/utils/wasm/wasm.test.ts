function mockScriptInjection(onAppend: (script: Partial<HTMLScriptElement>) => void) {
  const mockScript: Partial<HTMLScriptElement> = {}
  vi.spyOn(document, 'createElement').mockReturnValue(mockScript as HTMLScriptElement)
  vi.spyOn(document.head, 'appendChild').mockImplementation(() => {
    onAppend(mockScript)
    return mockScript as Node
  })
  return mockScript
}

function createMockModule() {
  const HEAPF64 = new Float64Array(256)
  const _malloc = vi.fn().mockReturnValue(16)
  const _free = vi.fn()
  const ccall = vi.fn((_name, _returnType, _argTypes, args) => {
    const resultPtr = Number(args[2])
    const offset = resultPtr / Float64Array.BYTES_PER_ELEMENT
    HEAPF64[offset] = 123.45
    HEAPF64[offset + 1] = 120.0
    HEAPF64.set([90, 80, 70, 60, 50, 40, 30, 20], offset + 2)
    HEAPF64[offset + 10] = 75.0
  })

  return { HEAPF64, _malloc, _free, ccall }
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

    const result = await calculate(2, 151.91)

    expect(window.createCalculatorModule).toHaveBeenCalledTimes(1)
    expect(module._malloc).toHaveBeenCalledWith(88)
    expect(module.ccall).toHaveBeenCalledWith(
      'calculate',
      null,
      ['number', 'number', 'number'],
      [2, 151.91, 16]
    )
    expect(module._free).toHaveBeenCalledWith(16)
    expect(result).toEqual({
      am_capacity: 123.45,
      overall_cathode_capacity: 120,
      material_utilization: [90, 80, 70, 60, 50, 40, 30, 20],
      overall_cathode_utilization: 75,
    })
  })

  it('reuses module on subsequent calls', async () => {
    const { calculate } = await import('./wasm')
    const module = createMockModule()
    window.createCalculatorModule = vi.fn().mockResolvedValue(module)

    await calculate(2, 151.91)
    await calculate(3, 200)
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
    const result = await calculate(2, 151.91)

    expect(document.createElement).toHaveBeenCalledWith('script')
    expect(mockScript.src).toContain('calculator.js')
    expect(result.am_capacity).toBe(123.45)
  })

  it('throws when calculator script fails to load', async () => {
    mockScriptInjection((script) => {
      script.onerror!.call(script as GlobalEventHandlers, new Event('error'))
    })

    const { calculate } = await import('./wasm')
    await expect(calculate(2, 151.91)).rejects.toThrow('Failed to load calculator.js')
  })
})
