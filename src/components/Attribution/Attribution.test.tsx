import { render, screen } from '@testing-library/react'
import { Attribution } from './Attribution'

describe('Attribution', () => {
  it('renders the name and email in a span', () => {
    const { container } = render(
      <Attribution firstName="Brandon" lastName="Lee" email="brandon.lee@nasa.gov" />
    )
    expect(container.firstChild?.nodeName).toBe('SPAN')
    expect(screen.getByText('Brandon Lee <brandon.lee@nasa.gov>')).toBeInTheDocument()
  })
})
