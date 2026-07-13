import { NavLink } from 'react-router-dom'
import styles from './Navbar.module.css'

const navItems = [
  { to: '/', label: 'Optimize' },
  { to: '/materials', label: 'Materials' },
  { to: '/cathodes', label: 'Cathodes' },
]

export const Navbar = () => {
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
    </nav>
  )
}
