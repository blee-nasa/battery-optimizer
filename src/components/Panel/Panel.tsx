import styles from './Panel.module.css'

type PanelProps = React.HTMLAttributes<HTMLDivElement>

export const Panel = ({ className, children, ...rest }: PanelProps) => {
  return (
    <div className={[styles.panel, className].filter(Boolean).join(' ')} {...rest}>
      {children}
    </div>
  )
}
