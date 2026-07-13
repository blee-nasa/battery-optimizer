import { render, screen } from '@testing-library/react'
import { CathodeForm } from './CathodeForm'
import type { Material } from '@types'

const materials: Material[] = [
  {
    id: 'mat-1',
    name: 'LiFePO4',
    category: 'Active Material',
    grainSize: 1,
    density: 3.6,
    molecularWeight: 157.76,
    eConductivity: 1e-9,
    liConductivity: 1e-5,
  },
  {
    id: 'mat-2',
    name: 'LGPS',
    category: 'Solid Electrolyte',
    grainSize: 2,
    density: 1.95,
    molecularWeight: 436.02,
    eConductivity: 1e-9,
    liConductivity: 1.2e-2,
  },
]

describe('CathodeForm', () => {
  it('renders with required fields', () => {
    render(<CathodeForm materials={materials} onSubmit={() => { }} />)
    expect(screen.getByLabelText('Name')).toBeInTheDocument()
    expect(screen.getByText('Create')).toBeInTheDocument()
  })

  it('shows Update button when initial is provided', () => {
    const cathode = {
      id: '1',
      name: 'My Cathode',
      components: [{ materialId: 'mat-1', massPercent: 80 }],
    }
    render(<CathodeForm initial={cathode} materials={materials} onSubmit={() => { }} />)
    expect(screen.getByText('Update')).toBeInTheDocument()
    expect(screen.getByDisplayValue('My Cathode')).toBeInTheDocument()
  })

  it('lists available materials in the select', () => {
    render(<CathodeForm materials={materials} onSubmit={() => { }} />)
    expect(screen.getByText('LiFePO4')).toBeInTheDocument()
    expect(screen.getByText('LGPS')).toBeInTheDocument()
  })
})
