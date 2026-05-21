import type { ButtonHTMLAttributes } from 'react'
import styles from './Button.module.css'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'default'
}

export const Button = ({ variant = 'default', className, ...props }: ButtonProps) => {
  const btnClass = `${styles.button} ${styles[variant]} ${className || ''}`.trim()
  return <button className={btnClass} {...props} />
}
