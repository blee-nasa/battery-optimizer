

function mockScriptInjection(onAppend: (script: Partial<HTMLScriptElement>) => void) {
  const mockScript: Partial<HTMLScriptElement> = {}
  vi.spyOn(document, 'createElement').mockReturnValue(mockScript as HTMLScriptElement)
  vi.spyOn(document.head, 'appendChild').mockImplementation(() => {
    onAppend(mockScript)
    return mockScript as Node
  })
  return mockScript
}

describe('wasm util', () => {
  afterEach(() => {
    vi.restoreAllMocks()
    vi.resetModules()
    delete window.createCalculatorModule
  })

  it('loads calculator script on first call', async () => {
    const { calculate } = await import('./wasm');
    window.createCalculatorModule = vi.fn().mockResolvedValue({
      ccall: vi.fn().mockReturnValue(123.45)
    })
    const result = await calculate(2, 151.91)
    expect(window.createCalculatorModule).toHaveBeenCalledTimes(1)
    expect(result).toBe(123.45)
  });

  it('reuses module on subsequent calls', async () => {
    const { calculate } = await import('./wasm');
    const mockCcall = vi.fn().mockReturnValue(123.45)
    window.createCalculatorModule = vi.fn().mockResolvedValue({
      ccall: mockCcall,
    })
    await calculate(2, 151.91)
    await calculate(3, 200)
    expect(window.createCalculatorModule).toHaveBeenCalledTimes(1)
    expect(mockCcall).toHaveBeenCalledTimes(2)
  });

  it('injects a script when createCalculatorModule is not on window', async () => {
    const mockScript = mockScriptInjection((script) => {
      window.createCalculatorModule = vi.fn().mockResolvedValue({
        ccall: vi.fn().mockReturnValue(42),
      })
      script.onload!.call(script as GlobalEventHandlers, new Event('load'))
    })

    const { calculate } = await import('./wasm')
    const result = await calculate(2, 151.91)

    expect(document.createElement).toHaveBeenCalledWith('script')
    expect(mockScript.src).toContain('calculator.js')
    expect(result).toBe(42)
  })

  it('throws when calculator script fails to load', async () => {
    mockScriptInjection((script) => {
      script.onerror!.call(script as GlobalEventHandlers, new Event('error'))
    })

    const { calculate } = await import('./wasm')
    await expect(calculate(2, 151.91)).rejects.toThrow('Failed to load calculator.js')
  })
})
