import type { Cathode } from '@types'

export const seedCathodes: Cathode[] = [
  {
    id: 'seed-lfp-cathode',
    name: 'LFP Standard',
    components: [
      { materialId: 'seed-lifepo4', massPercent: 70 },
      { materialId: 'seed-lgps', massPercent: 25 },
      { materialId: 'seed-carbon-black', massPercent: 5 },
    ],
  },
  {
    id: 'seed-nmc-cathode',
    name: 'NMC-622 Standard',
    components: [
      { materialId: 'seed-nmc622', massPercent: 80 },
      { materialId: 'seed-li6ps5cl', massPercent: 15 },
      { materialId: 'seed-vgcf', massPercent: 5 },
    ],
  },
  {
    id: 'seed-lco-cathode',
    name: 'LCO Standard',
    components: [
      { materialId: 'seed-licoo2', massPercent: 75 },
      { materialId: 'seed-llzo', massPercent: 20 },
      { materialId: 'seed-carbon-black', massPercent: 5 },
    ],
  },
  {
    id: 'seed-complex-cathode',
    name: 'Multi-Component Research',
    components: [
      { materialId: 'seed-nmc622', massPercent: 50 },
      { materialId: 'seed-lifepo4', massPercent: 15 },
      { materialId: 'seed-lgps', massPercent: 12 },
      { materialId: 'seed-li6ps5cl', massPercent: 10 },
      { materialId: 'seed-carbon-black', massPercent: 8 },
      { materialId: 'seed-vgcf', massPercent: 5 },
    ],
  },
]
