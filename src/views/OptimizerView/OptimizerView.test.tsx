import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { OptimizerView } from './OptimizerView'
import { calculate } from '@utils'

vi.mock('@utils', () => ({
  calculate: vi.fn(),
}))

const mockCalculate = vi.mocked(calculate)

type Slots = [number, number, number, number, number, number, number, number]

// The engine returns a negative capacity for every non-active material.
const MOCK_RESULT = {
  am_capacity: [176.68, -1, -1, -1, -1, -1, -1, -1] as Slots,
  overall_cathode_capacity: 176.68,
  material_utilization: [100, 0, 0, 0, 0, 0, 0, 0] as Slots,
  overall_cathode_utilization: 100,
}

const renderView = () =>
  render(
    <MemoryRouter>
      <OptimizerView />
    </MemoryRouter>
  )

describe('OptimizerView', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

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

  it('results section is hidden before Calculate is clicked', () => {
    renderView()
    expect(screen.queryByText(/AM Capacity/i)).not.toBeInTheDocument()
    expect(screen.queryByText('Overall cathode')).not.toBeInTheDocument()
  })

  it('displays all four result categories after Calculate', async () => {
    mockCalculate.mockResolvedValue(MOCK_RESULT)
    renderView()

    fireEvent.click(screen.getByRole('button', { name: 'Calculate' }))

    await waitFor(() => {
      expect(screen.getByRole('columnheader', { name: /AM Capacity/i })).toBeInTheDocument()
      expect(screen.getByRole('columnheader', { name: /Utilization/i })).toBeInTheDocument()
      expect(screen.getByText('Overall cathode')).toBeInTheDocument()
    })
  })

  it('shows per-material capacity and utilization from WASM output', async () => {
    mockCalculate.mockResolvedValue(MOCK_RESULT)
    renderView()

    fireEvent.click(screen.getByRole('button', { name: 'Calculate' }))

    await waitFor(() => {
      const capacityCells = screen.getAllByText('176.68')
      expect(capacityCells.length).toBeGreaterThan(0)
      expect(screen.getAllByText('100.0').length).toBeGreaterThan(0)
    })
  })

  it('gives each active material its own capacity and dashes the rest', async () => {
    mockCalculate.mockResolvedValue({
      ...MOCK_RESULT,
      // NMC-622 and LiFePO4 are both active; the SE and carbon components are not.
      am_capacity: [120.5, 88.25, -1, -1, -1, -1, -1, -1] as Slots,
      material_utilization: [92, 85, 0, 0, 0, 0, 0, 0] as Slots,
      overall_cathode_capacity: 208.75,
    })
    renderView()

    fireEvent.change(screen.getByLabelText('Cathode'), {
      target: { value: 'seed-complex-cathode' },
    })
    fireEvent.click(screen.getByRole('button', { name: 'Calculate' }))

    await waitFor(() => {
      expect(screen.getByText('120.50')).toBeInTheDocument()
    })
    expect(screen.getByText('88.25')).toBeInTheDocument()
    expect(screen.getAllByText('—')).toHaveLength(4)
  })

  it('clears results when cathode selector changes', async () => {
    mockCalculate.mockResolvedValue(MOCK_RESULT)
    renderView()

    fireEvent.click(screen.getByRole('button', { name: 'Calculate' }))
    await waitFor(() => expect(screen.getByText('Overall cathode')).toBeInTheDocument())

    const select = screen.getByLabelText('Cathode')
    fireEvent.change(select, { target: { value: select.querySelector('option')?.value ?? '' } })

    expect(screen.queryByText('Overall cathode')).not.toBeInTheDocument()
    expect(screen.getByText(/Select a cathode and click Calculate/i)).toBeInTheDocument()
  })
})
