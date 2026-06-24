interface CalculatorModule {
  ccall: (name: string, returnType: string | null, argTypes: string[], args: unknown[]) => void
  _malloc: (size: number) => number
  _free: (ptr: number) => void
  HEAPF64: Float64Array
}

export interface CalculationResult {
  am_capacity: number
  overall_cathode_capacity: number
  material_utilization: [number, number, number, number, number, number, number, number]
  overall_cathode_utilization: number
}

const MATERIAL_SLOTS = 8
const RESULT_DOUBLE_COUNT = 1 + 1 + MATERIAL_SLOTS + 1
const RESULT_BYTES = RESULT_DOUBLE_COUNT * Float64Array.BYTES_PER_ELEMENT

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

export async function calculate(n: number, molecularWeight: number): Promise<CalculationResult> {
  const module = await loadCalculatorModule()

  const resultPtr = module._malloc(RESULT_BYTES)
  try {
    module.ccall(
      'calculate',
      null,
      ['number', 'number', 'number'],
      [n, molecularWeight, resultPtr]
    )

    const offset = resultPtr / Float64Array.BYTES_PER_ELEMENT
    return {
      am_capacity: module.HEAPF64[offset],
      overall_cathode_capacity: module.HEAPF64[offset + 1],
      material_utilization: [
        module.HEAPF64[offset + 2],
        module.HEAPF64[offset + 3],
        module.HEAPF64[offset + 4],
        module.HEAPF64[offset + 5],
        module.HEAPF64[offset + 6],
        module.HEAPF64[offset + 7],
        module.HEAPF64[offset + 8],
        module.HEAPF64[offset + 9],
      ],
      overall_cathode_utilization: module.HEAPF64[offset + 2 + MATERIAL_SLOTS],
    }
  } finally {
    module._free(resultPtr)
  }
}
