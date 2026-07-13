import { fireEvent, render, screen } from '@testing-library/react'
import { MaterialsView } from './MaterialsView'

describe('MaterialsView', () => {
  it('renders without props', () => {
    render(<MaterialsView />)
    expect(screen.getByText('Materials')).toBeInTheDocument()
    expect(screen.getByText('Add Material')).toBeInTheDocument()
  })

  it('opens material form in a modal when Add Material is clicked', () => {
    render(<MaterialsView />)

    fireEvent.click(screen.getByRole('button', { name: 'Add Material' }))

    expect(screen.getByRole('dialog', { name: 'Add Material' })).toBeInTheDocument()
    expect(screen.getByLabelText('Name')).toBeInTheDocument()
  })
})
