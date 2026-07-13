import { fireEvent, render, screen } from '@testing-library/react'
import { Modal } from './Modal'

describe('Modal', () => {
  it('does not render when closed', () => {
    render(
      <Modal isOpen={false} title="Closed" onClose={() => { }}>
        <p>Body</p>
      </Modal>
    )

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('renders dialog content when open', () => {
    render(
      <Modal isOpen title="Open" onClose={() => { }}>
        <p>Body</p>
      </Modal>
    )

    expect(screen.getByRole('dialog', { name: 'Open' })).toBeInTheDocument()
    expect(screen.getByText('Body')).toBeInTheDocument()
  })

  it('calls onClose when close button is clicked', () => {
    const onClose = vi.fn()

    render(
      <Modal isOpen title="Open" onClose={onClose}>
        <p>Body</p>
      </Modal>
    )

    fireEvent.click(screen.getByRole('button', { name: 'Close modal' }))
    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it('traps focus within the dialog on Tab', () => {
    render(
      <Modal isOpen title="Trap" onClose={() => { }}>
        <input data-testid="first" />
        <input data-testid="last" />
      </Modal>
    )

    const closeBtn = screen.getByRole('button', { name: 'Close modal' })
    const last = screen.getByTestId('last')

    // Focus last element, Tab should wrap to close button (first focusable)
    last.focus()
    fireEvent.keyDown(window, { key: 'Tab' })
    expect(document.activeElement).toBe(closeBtn)

    // Focus close button, Shift+Tab should wrap to last
    closeBtn.focus()
    fireEvent.keyDown(window, { key: 'Tab', shiftKey: true })
    expect(document.activeElement).toBe(last)
  })

  it('restores focus to previously focused element on close', () => {
    const trigger = document.createElement('button')
    document.body.appendChild(trigger)
    trigger.focus()

    const { unmount } = render(
      <Modal isOpen title="Restore" onClose={() => { }}>
        <input />
      </Modal>
    )

    unmount()
    expect(document.activeElement).toBe(trigger)
    document.body.removeChild(trigger)
  })
})