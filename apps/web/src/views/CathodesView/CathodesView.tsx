import { useRef, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Calculator, Download, Pencil, Plus, RotateCcw, Trash2, Upload } from 'lucide-react'
import { Button, CathodeForm, Modal, SimpleTable } from "@components"
import { PIE_COLORS, contrastText } from "@components"
import { useCathodes } from "@stores"
import { useMaterials } from "@stores"
import type { Cathode } from "@types"

export const CathodesView = () => {
  const { cathodes, add, update, remove, exportJSON, importJSON, reset } = useCathodes()
  const { materials } = useMaterials()
  const [searchParams] = useSearchParams()
  const editParam = searchParams.get('edit')
  const initialEdit = editParam ? cathodes.find((c) => c.id === editParam) ?? null : null
  const [editing, setEditing] = useState<Cathode | null>(initialEdit)
  const [showForm, setShowForm] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const navigate = useNavigate()

  const closeForm = () => {
    setEditing(null)
    setShowForm(false)
  }

  const handleAdd = (cathode: Omit<Cathode, 'id'>) => {
    add(cathode)
    closeForm()
  }

  const handleUpdate = (cathode: Omit<Cathode, 'id'>) => {
    if (!editing) return
    update(editing.id, cathode)
    closeForm()
  }

  const handleExport = () => {
    const blob = new Blob([exportJSON()], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'cathodes.json'
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

  const materialName = (id: string) =>
    materials.find((m) => m.id === id)?.name ?? id

  const rows = cathodes.map((c) => ({
    name: c.name,
    materials: (
      <span style={{ display: 'flex', gap: '0.3rem', flexWrap: 'wrap' }}>
        {c.components.map((comp, i) => (
          <span
            key={i}
            style={{
              display: 'inline-block',
              padding: '0.15rem 0.5rem',
              borderRadius: '999px',
              fontSize: '0.78rem',
              background: PIE_COLORS[i % PIE_COLORS.length],
              color: contrastText(PIE_COLORS[i % PIE_COLORS.length]),
              whiteSpace: 'nowrap',
            }}
          >
            {materialName(comp.materialId)}
          </span>
        ))}
      </span>
    ),
    componentCount: c.components.length,
    actions: (
      <span style={{ display: 'flex', gap: '0.25rem', justifyContent: 'flex-end' }}>
        <Button style={{ padding: '0.2rem', lineHeight: 0 }} onClick={() => navigate(`/?cathode=${c.id}`)} aria-label={`Calculate ${c.name}`}>
          <Calculator size={16} />
        </Button>
        <Button style={{ padding: '0.2rem', lineHeight: 0 }} onClick={() => { setEditing(c); setShowForm(false) }} aria-label={`Edit ${c.name}`}>
          <Pencil size={16} />
        </Button>
        <Button style={{ padding: '0.2rem', lineHeight: 0 }} onClick={() => { if (window.confirm(`Delete ${c.name}?`)) remove(c.id) }} aria-label={`Delete ${c.name}`}>
          <Trash2 size={16} />
        </Button>
      </span>
    ),
  }))

  return (
    <div>
      <h2>Cathodes</h2>
      <div style={{ marginBottom: '1rem', display: 'flex', gap: '0.5rem' }}>
        <Button variant="primary" onClick={() => { setShowForm(true); setEditing(null) }}>
          <Plus size={14} /> Add Cathode
        </Button>
        <Button onClick={handleExport}><Download size={14} /> Export</Button>
        <Button onClick={() => fileInputRef.current?.click()}><Upload size={14} /> Import</Button>
        <Button onClick={() => { if (window.confirm('Reset all cathodes to defaults? This will discard any changes.')) reset() }}>
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
        title={editing ? 'Edit Cathode' : 'Add Cathode'}
        onClose={closeForm}
      >
        {editing ? (
          <CathodeForm
            initial={editing}
            materials={materials}
            onSubmit={handleUpdate}
            onCancel={closeForm}
          />
        ) : (
          <CathodeForm
            materials={materials}
            onSubmit={handleAdd}
            onCancel={closeForm}
          />
        )}
      </Modal>

      <SimpleTable
        data={rows}
        columns={{
          name: 'Name',
          materials: 'Materials',
          componentCount: '# Components',
          actions: '',
        }}
      />
    </div>
  )
}
