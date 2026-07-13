import { useRef, useState } from 'react'
import { Download, Pencil, Plus, RotateCcw, Trash2, Upload } from 'lucide-react'
import { Button, MaterialForm, Modal, SimpleTable } from "@components"
import { useMaterials } from "@stores"
import type { Material } from "@types"

export const MaterialsView = () => {
  const { materials, add, update, remove, reset, exportJSON, importJSON } = useMaterials()
  const [editing, setEditing] = useState<Material | null>(null)
  const [showForm, setShowForm] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const closeForm = () => {
    setEditing(null)
    setShowForm(false)
  }

  const handleAdd = (material: Omit<Material, 'id'>) => {
    add(material)
    closeForm()
  }

  const handleUpdate = (material: Omit<Material, 'id'>) => {
    if (!editing) return
    update(editing.id, material)
    closeForm()
  }

  const handleExport = () => {
    const blob = new Blob([exportJSON()], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'materials.json'
    a.click()
    URL.revokeObjectURL(url)
  }

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    file.text().then((json) => {
      importJSON(json)
    })
    e.target.value = ''
  }

  const unit = (value: number | undefined, u: string) =>
    value != null ? <>{value} <span style={{ fontSize: '0.75em', color: 'var(--color-muted, #888)' }}>{u}</span></> : ''

  const rows = materials.map((m) => ({
    name: m.name,
    category: m.category,
    grainSize: unit(m.grainSize, 'μm'),
    density: unit(m.density, 'g/cm³'),
    molecularWeight: unit(m.molecularWeight, 'g/mol'),
    eConductivity: unit(m.eConductivity, 'S/cm'),
    liConductivity: unit(m.liConductivity, 'S/cm'),
    reductionPotential: unit(m.reductionPotential, 'V'),
    valency: m.valency ?? '',
    actions: (
      <span style={{ display: 'flex', gap: '0.25rem', justifyContent: 'flex-end' }}>
        <Button style={{ padding: '0.2rem', lineHeight: 0 }} onClick={() => { setEditing(m); setShowForm(false) }} aria-label={`Edit ${m.name}`}>
          <Pencil size={16} />
        </Button>
        <Button style={{ padding: '0.2rem', lineHeight: 0 }} onClick={() => { if (window.confirm(`Delete ${m.name}?`)) remove(m.id) }} aria-label={`Delete ${m.name}`}>
          <Trash2 size={16} />
        </Button>
      </span>
    ),
  }))

  return (
    <div>
      <h2>Materials</h2>
      <div style={{ marginBottom: '1rem', display: 'flex', gap: '0.5rem' }}>
        <Button variant="primary" onClick={() => { setShowForm(true); setEditing(null) }}>
          <Plus size={14} /> Add Material
        </Button>
        <Button onClick={handleExport}><Download size={14} /> Export</Button>
        <Button onClick={() => fileInputRef.current?.click()}><Upload size={14} /> Import</Button>
        <Button onClick={() => { if (window.confirm('Reset all materials to defaults? This will discard any changes.')) reset() }}>
          <RotateCcw size={14} /> Reset to Defaults
        </Button>
        <input
          ref={fileInputRef}
          type="file"
          accept=".json"
          onChange={handleImport}
          hidden
        />
      </div>

      <Modal
        isOpen={showForm || Boolean(editing)}
        title={editing ? 'Edit Material' : 'Add Material'}
        onClose={closeForm}
      >
        {editing ? (
          <MaterialForm
            initial={editing}
            onSubmit={handleUpdate}
            onCancel={closeForm}
          />
        ) : (
          <MaterialForm
            onSubmit={handleAdd}
            onCancel={closeForm}
          />
        )}
      </Modal>

      <SimpleTable
        data={rows}
        columns={{
          name: 'Name',
          category: 'Category',
          grainSize: 'Grain Size',
          density: 'Density',
          molecularWeight: 'Mol. Weight',
          eConductivity: 'e⁻ Cond.',
          liConductivity: 'Li⁺ Cond.',
          reductionPotential: 'Red. Potential',
          valency: 'Valency',
          actions: '',
        }}
      />
    </div>
  )
}
