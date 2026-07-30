import { fireEvent, render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { CathodesView } from './CathodesView'

const renderView = () =>
  render(
    <MemoryRouter>
      <CathodesView />
    </MemoryRouter>
  )

describe('CathodesView', () => {
  it('renders heading and add button', () => {
    renderView()
    expect(screen.getByText('Cathodes')).toBeInTheDocument()
    expect(screen.getByText('Add Cathode')).toBeInTheDocument()
  })

  it('opens cathode form in a modal when Add Cathode is clicked', () => {
    renderView()
    fireEvent.click(screen.getByRole('button', { name: 'Add Cathode' }))
    expect(screen.getByRole('dialog', { name: 'Add Cathode' })).toBeInTheDocument()
    expect(screen.getByLabelText('Name')).toBeInTheDocument()
  })
})
