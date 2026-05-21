import { useState } from 'react'
import type { Material, MaterialCategory } from '@types'
import { Button } from '@components'
import styles from './MaterialForm.module.css'

interface MaterialFormProps {
  initial?: Material
  onSubmit: (material: Omit<Material, 'id'>) => void
  onCancel?: () => void
}

const categories: MaterialCategory[] = [
  'Active Material',
  'Solid Electrolyte',
  'Conductor',
]

const empty: Omit<Material, 'id'> = {
  name: '',
  category: 'Active Material',
  grainSize: 0,
  density: 0,
  molecularWeight: 0,
  eConductivity: 0,
  liConductivity: 0,
}

export const MaterialForm = ({ initial, onSubmit, onCancel }: MaterialFormProps) => {
  const [form, setForm] = useState<Omit<Material, 'id'>>(
    initial ? { ...initial } : { ...empty }
  )

  const set = (field: string, value: string | number) =>
    setForm((prev) => ({ ...prev, [field]: value }))

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit(form)
    if (!initial) setForm({ ...empty })
  }

  const isActiveMaterial = form.category === 'Active Material'

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      <label>
        Name
        <input
          type="text"
          value={form.name}
          onChange={(e) => set('name', e.target.value)}
          required
          autoFocus
        />
      </label>

      <label>
        Category
        <select
          value={form.category}
          onChange={(e) => set('category', e.target.value)}
        >
          {categories.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
      </label>

      <label>
        Grain Size (μm)
        <input
          type="number"
          step="any"
          value={form.grainSize}
          onChange={(e) => set('grainSize', Number(e.target.value))}
          required
        />
      </label>

      <label>
        Density (g/cm³)
        <input
          type="number"
          step="any"
          value={form.density}
          onChange={(e) => set('density', Number(e.target.value))}
          required
        />
      </label>

      <label>
        Mol. Weight (g/mol)
        <input
          type="number"
          step="any"
          value={form.molecularWeight}
          onChange={(e) => set('molecularWeight', Number(e.target.value))}
          required
        />
      </label>

      <label>
        e⁻ Conductivity (S/cm)
        <input
          type="number"
          step="any"
          value={form.eConductivity}
          onChange={(e) => set('eConductivity', Number(e.target.value))}
          required
        />
      </label>

      <label>
        Li⁺ Conductivity (S/cm)
        <input
          type="number"
          step="any"
          value={form.liConductivity}
          onChange={(e) => set('liConductivity', Number(e.target.value))}
          required
        />
      </label>

      {isActiveMaterial && (
        <>
          <label>
            Reduction Potential (V)
            <input
              type="number"
              step="any"
              value={form.reductionPotential ?? ''}
              onChange={(e) => set('reductionPotential', Number(e.target.value))}
            />
          </label>

          <label>
            Valency
            <input
              type="number"
              step="1"
              value={form.valency ?? ''}
              onChange={(e) => set('valency', Number(e.target.value))}
            />
          </label>
        </>
      )}

      <div className={styles.actions}>
        <Button variant="primary" type="submit">{initial ? 'Update' : 'Add'}</Button>
        {onCancel && <Button type="button" onClick={onCancel}>Cancel</Button>}
      </div>
    </form>
  )
}
