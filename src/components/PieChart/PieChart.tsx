import styles from './PieChart.module.css'

interface Slice {
  label: string
  value: number
  color: string
}

interface PieChartProps {
  slices: Slice[]
  size?: number
}

const COLORS = ['#5b7bb4', '#8faad0', '#bec9d9', '#e8c872', '#d4956a', '#a3c293']

const describeArc = (cx: number, cy: number, r: number, startAngle: number, endAngle: number) => {
  const start = polarToCartesian(cx, cy, r, endAngle)
  const end = polarToCartesian(cx, cy, r, startAngle)
  const largeArc = endAngle - startAngle > 180 ? 1 : 0
  return `M ${cx} ${cy} L ${start.x} ${start.y} A ${r} ${r} 0 ${largeArc} 0 ${end.x} ${end.y} Z`
}

const polarToCartesian = (cx: number, cy: number, r: number, angleDeg: number) => {
  const rad = ((angleDeg - 90) * Math.PI) / 180
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) }
}

export const PieChart = ({ slices, size = 160 }: PieChartProps) => {
  const total = slices.reduce((sum, s) => sum + s.value, 0)
  if (total === 0) return null

  const basis = 100
  const remainder = Math.max(0, basis - total)
  const allSlices = remainder > 0.01
    ? [...slices, { label: 'Remaining', value: remainder, color: '#e8e8e8' }]
    : slices

  const r = size / 2
  const cx = r
  const cy = r
  let currentAngle = 0

  return (
    <div className={styles.chart}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        {allSlices.map((slice, i) => {
          const angle = (slice.value / basis) * 360
          // Full circle needs special handling
          if (angle >= 359.99) {
            return (
              <circle key={i} cx={cx} cy={cy} r={r} fill={slice.color || COLORS[i % COLORS.length]} />
            )
          }
          const path = describeArc(cx, cy, r, currentAngle, currentAngle + angle)
          currentAngle += angle
          return (
            <path
              key={i}
              d={path}
              fill={slice.color || COLORS[i % COLORS.length]}
              stroke="#fff"
              strokeWidth={1}
            />
          )
        })}
      </svg>
      <ul className={styles.legend}>
        {slices.map((slice, i) => (
          <li key={i}>
            <span
              className={styles.swatch}
              style={{ backgroundColor: slice.color || COLORS[i % COLORS.length] }}
            />
            {slice.label} ({slice.value}%)
          </li>
        ))}
      </ul>
    </div>
  )
}

export { COLORS as PIE_COLORS }

export const contrastText = (hex: string): string => {
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255
  return luminance > 0.55 ? '#1a1a2e' : '#fff'
}
