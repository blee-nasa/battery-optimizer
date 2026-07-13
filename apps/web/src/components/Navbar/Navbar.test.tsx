import { render, screen } from '@testing-library/react'
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

  it('highlights active link', () => {
    render(
      <MemoryRouter initialEntries={['/materials']}>
        <Navbar />
      </MemoryRouter>
    )
    expect(screen.getByText('Materials').className).toMatch(/active/)
  })
})
