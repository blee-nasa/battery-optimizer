import { useState } from 'react'
import type { Cathode, CathodeComponent, Material } from '@types'
import { Button, PieChart, PIE_COLORS } from '@components'
import styles from './CathodeForm.module.css'

interface CathodeFormProps {
  initial?: Cathode
  materials: Material[]
  onSubmit: (cathode: Omit<Cathode, 'id'>) => void
  onCancel?: () => void
}

const emptyComponent = (): CathodeComponent => ({
  materialId: '',
  massPercent: 0,
})

export const CathodeForm = ({ initial, materials, onSubmit, onCancel }: CathodeFormProps) => {
  const [name, setName] = useState(initial?.name ?? '')
  const [components, setComponents] = useState<CathodeComponent[]>(
    initial?.components.length ? initial.components.map((c) => ({ ...c })) : [emptyComponent()]
  )

  const updateComponent = (index: number, field: keyof CathodeComponent, value: string | number) => {
    setComponents((prev) => prev.map((c, i) => i === index ? { ...c, [field]: value } : c))
  }

  const addComponent = () => setComponents((prev) => [...prev, emptyComponent()])

  const removeComponent = (index: number) => {
    setComponents((prev) => prev.filter((_, i) => i !== index))
  }

  const totalMass = components.reduce((sum, c) => sum + c.massPercent, 0)
  const isValid = Math.abs(totalMass - 100) < 0.001

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!isValid) return
    onSubmit({ name, components: components.filter((c) => c.materialId) })
  }

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      <label>
        Name
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          autoFocus
        />
      </label>

      <fieldset>
        <legend>Materials</legend>
        {components.map((comp, i) => (
          <div key={i} className={styles.componentRow}>
            <label>
              Material
              <select
                value={comp.materialId}
                onChange={(e) => updateComponent(i, 'materialId', e.target.value)}
                required
              >
                <option value="">Select…</option>
                {materials
                  .filter((m) => m.id === comp.materialId || !components.some((other, j) => j !== i && other.materialId === m.id))
                  .map((m) => (
                    <option key={m.id} value={m.id}>{m.name}</option>
                  ))}
              </select>
            </label>
            <label>
              Mass %
              <input
                type="number"
                step="any"
                min="0"
                max="100"
                value={comp.massPercent}
                onChange={(e) => updateComponent(i, 'massPercent', Number(e.target.value))}
                required
              />
            </label>
            {components.length > 1 && (
              <Button type="button" onClick={() => removeComponent(i)}>Remove</Button>
            )}
          </div>
        ))}
        <Button type="button" className={styles.addMaterial} onClick={addComponent}>Add Material</Button>
        <p style={{ margin: '0.5rem 0 0', fontSize: '0.85rem', color: isValid ? 'inherit' : '#c21e56' }}>
          Total: {totalMass}% {!isValid && '(must equal 100%)'}
        </p>
      </fieldset>

      {components.some((c) => c.materialId && c.massPercent > 0) && (
        <PieChart
          size={140}
          slices={components
            .filter((c) => c.materialId && c.massPercent > 0)
            .map((c, i) => ({
              label: materials.find((m) => m.id === c.materialId)?.name ?? 'Unknown',
              value: c.massPercent,
              color: PIE_COLORS[i % PIE_COLORS.length],
            }))}
        />
      )}

      <div className={styles.actions}>
        <Button variant="primary" type="submit" disabled={!isValid}>{initial ? 'Update' : 'Create'}</Button>
        {onCancel && <Button type="button" onClick={onCancel}>Cancel</Button>}
      </div>
    </form>
  )
}
