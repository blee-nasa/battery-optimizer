interface CalculatorModule {
  ccall: (name: string, returnType: string, argTypes: string[], args: unknown[]) => number
}

declare global {
  interface Window {
    createCalculatorModule?: () => Promise<CalculatorModule>
  }
}

let modulePromise: Promise<CalculatorModule> | null = null

async function loadCalculatorModule(): Promise<CalculatorModule> {
  if (!window.createCalculatorModule) {
    await new Promise<void>((resolve, reject) => {
      const script = document.createElement('script')
      script.src = import.meta.env.BASE_URL + 'calculator.js'
      script.onload = () => resolve()
      script.onerror = () => reject(new Error('Failed to load calculator.js'))
      document.head.appendChild(script)
    })
  }
  if (!modulePromise) {
    modulePromise = window.createCalculatorModule!()
  }
  return modulePromise
}

export async function calculate(n: number, molecularWeight: number): Promise<number> {
  const module = await loadCalculatorModule()
  return module.ccall(
    'calculate',
    'number',
    ['number', 'number'],
    [n, molecularWeight]
  )
}
