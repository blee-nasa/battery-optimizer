import { HashRouter } from 'react-router-dom'
import { Navbar } from '@components'
import { AppRoutes } from './routes'
import './theme.css'

export const App = () => {
  return (
    <HashRouter>
      <Navbar />
      <main style={{ padding: '0 1.5rem' }}>
        <AppRoutes />
      </main>
    </HashRouter>
  )
}
