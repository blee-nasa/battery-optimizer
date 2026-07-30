import { render, screen } from '@testing-library/react'
import { About } from './About'

describe('About', () => {
  it('renders a blurb describing the app', () => {
    render(<About />)
    expect(screen.getByText(/solid state batteries/i)).toBeInTheDocument()
  })

  it('renders contributor attributions', () => {
    render(<About />)
    expect(screen.getByText('Brandon Lee <brandon.lee@nasa.gov>')).toBeInTheDocument()
    expect(
      screen.getByText('Vesselin Yamakov <vesselin.i.yamakov@nasa.gov>')
    ).toBeInTheDocument()
  })

  it('renders the app version from app metadata', () => {
    render(<About />)
    expect(screen.getByText(`Version ${__APP_VERSION__}`)).toBeInTheDocument()
  })
})
