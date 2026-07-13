import type { SelectHTMLAttributes } from 'react'
import styles from './Select.module.css'

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string
}

export const Select = ({ label, id, className, ...props }: SelectProps) => {
  const selectClass = `${styles.select} ${className || ''}`.trim()
  if (!label) return <select id={id} className={selectClass} {...props} />
  return (
    <div className={styles.field}>
      <label htmlFor={id}>{label}</label>
      <select id={id} className={selectClass} {...props} />
    </div>
  )
}
