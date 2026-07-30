import { render, screen } from '@testing-library/react'
import { Panel } from './Panel'

describe('Panel', () => {
  it('renders children in a div', () => {
    const { container } = render(<Panel>content</Panel>)
    expect(container.firstChild?.nodeName).toBe('DIV')
    expect(screen.getByText('content')).toBeInTheDocument()
  })

  it('merges an extra className with its own', () => {
    const { container } = render(<Panel className="extra">content</Panel>)
    expect((container.firstChild as HTMLElement).className).toMatch(/extra/)
    expect((container.firstChild as HTMLElement).className.split(' ')).toHaveLength(2)
  })
})
