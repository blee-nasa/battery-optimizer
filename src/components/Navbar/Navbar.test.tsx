import { fireEvent, render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { Navbar } from './Navbar'

describe('Navbar', () => {
  it('renders without props', () => {
    render(
      <MemoryRouter>
        <Navbar />
      </MemoryRouter>
    )
  })

  it('renders all nav links', () => {
    render(
      <MemoryRouter>
        <Navbar />
      </MemoryRouter>
    )
    expect(screen.getByText('Optimize')).toBeInTheDocument()
    expect(screen.getByText('Materials')).toBeInTheDocument()
    expect(screen.getByText('Cathodes')).toBeInTheDocument()
  })

  it('opens the About modal when the About button is clicked', () => {
    render(
      <MemoryRouter>
        <Navbar />
      </MemoryRouter>
    )
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: 'About' }))
    expect(screen.getByRole('dialog', { name: 'About Cathcal' })).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: 'Close modal' }))
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('highlights active link', () => {
    render(
      <MemoryRouter initialEntries={['/materials']}>
        <Navbar />
      </MemoryRouter>
    )
    expect(screen.getByText('Materials').className).toMatch(/active/)
  })
})
