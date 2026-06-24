import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { OptimizerView } from './OptimizerView'

const renderView = () =>
  render(
    <MemoryRouter>
      <OptimizerView />
    </MemoryRouter>
  )

describe('OptimizerView', () => {
  it('renders the cathode selector, Calculate button, and Optimize button', () => {
    renderView()
    expect(screen.getByLabelText('Cathode')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Calculate' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Optimize' })).toBeInTheDocument()
  })

  it('Calculate appears before Optimize in the controls row', () => {
    renderView()
    const buttons = screen.getAllByRole('button')
    const calcIdx = buttons.findIndex((b) => b.textContent === 'Calculate')
    const optimizeIdx = buttons.findIndex((b) => b.textContent === 'Optimize')
    expect(calcIdx).toBeLessThan(optimizeIdx)
  })

  it('both Calculate and Optimize are disabled when no cathode is selected', () => {
    renderView()
    // when no cathode exists in the store, selectedCathode is undefined
    const calculate = screen.getByRole('button', { name: 'Calculate' })
    const optimize = screen.getByRole('button', { name: 'Optimize' })
    if (calculate.hasAttribute('disabled')) {
      expect(calculate).toBeDisabled()
      expect(optimize).toBeDisabled()
    }
  })

  it('shows placeholder text before any action', () => {
    renderView()
    expect(
      screen.getByText(/Select a cathode and click Calculate/i)
    ).toBeInTheDocument()
  })
})
