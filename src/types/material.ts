export type MaterialCategory = 'Active Material' | 'Solid Electrolyte' | 'Conductor'

export interface Material {
  id: string
  name: string
  category: MaterialCategory
  grainSize: number         // μm
  density: number           // g/cm³
  molecularWeight: number   // g/mol
  eConductivity: number     // S/cm
  liConductivity: number    // S/cm
  reductionPotential?: number  // V (active material only)
  valency?: number             // active material only
}
