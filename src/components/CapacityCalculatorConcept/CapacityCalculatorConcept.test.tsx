import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { CapacityCalculatorConcept } from './CapacityCalculatorConcept'
import { calculate } from '@utils'

vi.mock('@utils', () => ({
  calculate: vi.fn(),
}))

const mockCalculate = vi.mocked(calculate)

describe('CapacityCalculatorConcept', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('renders without props', () => {
    render(<CapacityCalculatorConcept />)
  })

  it('displays default input values', () => {
    render(<CapacityCalculatorConcept />)
    expect(screen.getByLabelText(/electrons transferred/i)).toHaveValue(1)
    expect(screen.getByLabelText(/molecular weight/i)).toHaveValue(151.91)
  })

  it('displays result after successful calculation', async () => {
    mockCalculate.mockResolvedValue({
      am_capacity: 176.68,
      overall_cathode_capacity: 176.68,
      material_utilization: [100, 0, 0, 0, 0, 0, 0, 0],
      overall_cathode_utilization: 100,
    })
    render(<CapacityCalculatorConcept />)

    fireEvent.click(screen.getByText('Calculate Specific Capacity'))

    await waitFor(() => {
      expect(screen.getByText('176.68 mAh/g')).toBeInTheDocument()
    })
    expect(mockCalculate).toHaveBeenCalledWith(1, 151.91)
  })

  it('shows error for invalid electron input', async () => {
    render(<CapacityCalculatorConcept />)
    fireEvent.change(screen.getByLabelText(/electrons transferred/i), { target: { value: '-1' } })
    fireEvent.click(screen.getByText('Calculate Specific Capacity'))

    await waitFor(() => {
      expect(screen.getByText(/electrons transferred must be a positive integer/i)).toBeInTheDocument()
    })
  })

  it('shows error for invalid molecular weight', async () => {
    render(<CapacityCalculatorConcept />)
    fireEvent.change(screen.getByLabelText(/molecular weight/i), { target: { value: '0' } })
    fireEvent.click(screen.getByText('Calculate Specific Capacity'))

    await waitFor(() => {
      expect(screen.getByText(/molecular weight must be a positive number/i)).toBeInTheDocument()
    })
  })

  it('shows error when WASM calculation fails', async () => {
    mockCalculate.mockRejectedValue(new Error('WASM broke'))
    render(<CapacityCalculatorConcept />)

    fireEvent.click(screen.getByText('Calculate Specific Capacity'))

    await waitFor(() => {
      expect(screen.getByText(/WASM broke/i)).toBeInTheDocument()
    })
  })
})
