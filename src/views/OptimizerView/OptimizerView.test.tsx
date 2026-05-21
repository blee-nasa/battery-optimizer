import { render, screen } from '@testing-library/react'
import { OptimizerView } from './OptimizerView'

describe('OptimizerView', () => {
  it('renders the cathode selector and optimize button', () => {
    render(<OptimizerView />)
    expect(screen.getByLabelText('Cathode')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Optimize' })).toBeDisabled()
  })
})
