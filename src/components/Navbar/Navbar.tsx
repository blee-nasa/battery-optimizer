import { useState } from 'react'
import { NavLink } from 'react-router-dom'
import { About, Modal } from '@components'
import styles from './Navbar.module.css'

const navItems = [
  { to: '/', label: 'Optimize' },
  { to: '/materials', label: 'Materials' },
  { to: '/cathodes', label: 'Cathodes' },
]

export const Navbar = () => {
  const [isAboutOpen, setIsAboutOpen] = useState(false)

  return (
    <nav className={styles.navbar}>
      {navItems.map(({ to, label }) => (
        <NavLink
          key={to}
          to={to}
          end={to === '/'}
          className={({ isActive }) =>
            [styles.link, isActive ? styles.active : ''].join(' ')
          }
        >
          {label}
        </NavLink>
      ))}
      <button
        type="button"
        className={[styles.link, styles.about].join(' ')}
        onClick={() => setIsAboutOpen(true)}
      >
        About
      </button>

      <Modal isOpen={isAboutOpen} title="About Cathcal" onClose={() => setIsAboutOpen(false)}>
        <About />
      </Modal>
    </nav>
  )
}
