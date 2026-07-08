interface CalculatorModule {
  ccall: (name: string, returnType: string | null, argTypes: string[], args: unknown[]) => void
  _malloc: (size: number) => number
  _free: (ptr: number) => void
  HEAPU8: Uint8Array
  HEAP32: Int32Array
  HEAPF64: Float64Array
}

export interface CathodeMaterialInput {
  name: string
  electronicConductivity: number
  liIonConductivity: number
  grainSize: number
  molecularWeight: number
  density: number
  reductionPotential: number
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

// Mirrors the current `type_Material`/`type_Cathode` layout in wasm/calculator.c:
//   typedef struct { char name[64]; double electronic_conductivity; double li_ion_conductivity;
//     double grain_size; double molecular_weight; double density; double reduction_potential; } type_Material;
//   typedef struct { int N_mat; type_Material Mat[8]; } type_Cathode;
const NAME_BYTES = 64
const MATERIAL_DOUBLE_COUNT = 6
const MATERIAL_BYTES = NAME_BYTES + MATERIAL_DOUBLE_COUNT * Float64Array.BYTES_PER_ELEMENT
const CATHODE_HEADER_BYTES = 8 // int32 N_mat + 4 bytes padding to align Mat[] to 8 bytes
const CATHODE_BYTES = CATHODE_HEADER_BYTES + MATERIAL_SLOTS * MATERIAL_BYTES

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

function writeCathode(
  module: CalculatorModule,
  cathodePtr: number,
  materials: CathodeMaterialInput[]
): void {
  if (materials.length === 0 || materials.length > MATERIAL_SLOTS) {
    throw new Error(`Cathode must have between 1 and ${MATERIAL_SLOTS} materials`)
  }

  module.HEAPU8.fill(0, cathodePtr, cathodePtr + CATHODE_BYTES)
  module.HEAP32[cathodePtr / 4] = materials.length

  const encoder = new TextEncoder()
  materials.forEach((material, i) => {
    const matPtr = cathodePtr + CATHODE_HEADER_BYTES + i * MATERIAL_BYTES
    const nameBytes = encoder.encode(material.name).slice(0, NAME_BYTES - 1)
    module.HEAPU8.set(nameBytes, matPtr)

    const doubleOffset = (matPtr + NAME_BYTES) / Float64Array.BYTES_PER_ELEMENT
    module.HEAPF64[doubleOffset] = material.electronicConductivity
    module.HEAPF64[doubleOffset + 1] = material.liIonConductivity
    module.HEAPF64[doubleOffset + 2] = material.grainSize
    module.HEAPF64[doubleOffset + 3] = material.molecularWeight
    module.HEAPF64[doubleOffset + 4] = material.density
    module.HEAPF64[doubleOffset + 5] = material.reductionPotential
  })
}

export async function calculate(materials: CathodeMaterialInput[]): Promise<CalculationResult> {
  const module = await loadCalculatorModule()

  const cathodePtr = module._malloc(CATHODE_BYTES)
  const resultPtr = module._malloc(RESULT_BYTES)
  try {
    writeCathode(module, cathodePtr, materials)

    module.ccall(
      'calculate',
      null,
      ['number', 'number'],
      [cathodePtr, resultPtr]
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
    module._free(cathodePtr)
    module._free(resultPtr)
  }
}
