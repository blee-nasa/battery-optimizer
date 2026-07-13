import { render, screen } from '@testing-library/react'
import { MaterialForm } from './MaterialForm'

describe('MaterialForm', () => {
  it('renders without props', () => {
    render(<MaterialForm onSubmit={() => { }} />)
    expect(screen.getByLabelText('Name')).toBeInTheDocument()
    expect(screen.getByText('Add')).toBeInTheDocument()
  })

  it('shows Update button when initial is provided', () => {
    const material = {
      id: '1',
      name: 'LiFePO4',
      category: 'Active Material' as const,
      grainSize: 1,
      density: 3.6,
      molecularWeight: 157.76,
      eConductivity: 1e-9,
      liConductivity: 1e-5,
    }
    render(<MaterialForm initial={material} onSubmit={() => { }} />)
    expect(screen.getByText('Update')).toBeInTheDocument()
    expect(screen.getByDisplayValue('LiFePO4')).toBeInTheDocument()
  })

  it('shows reduction potential and valency only for active materials', () => {
    render(<MaterialForm onSubmit={() => { }} />)
    expect(screen.getByLabelText('Reduction Potential (V)')).toBeInTheDocument()
    expect(screen.getByLabelText('Valency')).toBeInTheDocument()
  })
})
