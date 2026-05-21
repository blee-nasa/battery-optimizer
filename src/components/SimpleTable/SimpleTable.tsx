import type { CSSProperties, ReactNode } from 'react'
import styles from './SimpleTable.module.css'

type ColumnRenderer = string | (() => ReactNode)

interface SimpleTableProps {
  data?: object[]
  columns?: Record<string, ColumnRenderer>
  className?: string
  style?: CSSProperties
}

export const SimpleTable = ({ data = [], columns, className, style }: SimpleTableProps) => {
  const tableClass = `${styles.table} ${className || ''}`.trim();

  if (data.length === 0) {
    return (
      <table className={tableClass} style={style}>
        <tbody>
          <tr>
            <td>No data</td>
          </tr>
        </tbody>
      </table>
    )
  }

  const keys = columns ? Object.keys(columns) : Object.keys(data[0])
  const cell = (row: object, key: string): ReactNode =>
    (row as Record<string, ReactNode>)[key] ?? ''

  const renderHeader = (key: string) => {
    if (!columns) return key
    const renderer = columns[key]
    return typeof renderer === 'function' ? renderer() : renderer
  }

  return (
    <table className={tableClass} style={style}>
      <thead>
        <tr>
          {keys.map((col) => (
            <th key={col}>{renderHeader(col)}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {data.map((row, i) => (
          <tr key={i}>
            {keys.map((col) => (
              <td key={col}>{cell(row, col)}</td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  )
}
