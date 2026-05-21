import { fireEvent, render, screen } from '@testing-library/react'
import { CathodesView } from './CathodesView'

describe('CathodesView', () => {
  it('renders heading and add button', () => {
    render(<CathodesView />)
    expect(screen.getByText('Cathodes')).toBeInTheDocument()
    expect(screen.getByText('Add Cathode')).toBeInTheDocument()
  })

  it('opens cathode form in a modal when Add Cathode is clicked', () => {
    render(<CathodesView />)
    fireEvent.click(screen.getByRole('button', { name: 'Add Cathode' }))
    expect(screen.getByRole('dialog', { name: 'Add Cathode' })).toBeInTheDocument()
    expect(screen.getByLabelText('Name')).toBeInTheDocument()
  })
})
