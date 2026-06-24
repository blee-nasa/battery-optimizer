import { useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Pencil } from 'lucide-react'
import { Button, PieChart, PIE_COLORS, contrastText, Select } from '@components'
import { useCathodes, useMaterials } from '@stores'
import { calculate } from '@utils'
import styles from './OptimizerView.module.css'

interface CalcResult {
  materialName: string
  capacity: string
}

export const OptimizerView = () => {
  const { cathodes } = useCathodes()
  const { materials } = useMaterials()
  const [searchParams] = useSearchParams()
  const paramCathodeId = searchParams.get('cathode')
  const defaultId = (paramCathodeId && cathodes.some((c) => c.id === paramCathodeId))
    ? paramCathodeId
    : cathodes[0]?.id ?? ''
  const [selectedCathodeId, setSelectedCathodeId] = useState(defaultId)
  const navigate = useNavigate()

  const [nyi, setNyi] = useState(false)
  const [calcResults, setCalcResults] = useState<CalcResult[] | null>(null)
  const [calcLoading, setCalcLoading] = useState(false)
  const [calcError, setCalcError] = useState<string | null>(null)

  const selectedCathode = cathodes.find((c) => c.id === selectedCathodeId)

  const handleCalculate = async () => {
    if (!selectedCathode) return
    setCalcLoading(true)
    setCalcError(null)
    setNyi(false)
    try {
      const results: CalcResult[] = []
      for (const comp of selectedCathode.components) {
        const material = materials.find((m) => m.id === comp.materialId)
        if (material?.valency != null) {
          const calc = await calculate(material.valency, material.molecularWeight)
          results.push({ materialName: material.name, capacity: calc.am_capacity.toFixed(2) })
        }
      }
      setCalcResults(results)
    } catch (err) {
      setCalcError((err as Error).message)
    } finally {
      setCalcLoading(false)
    }
  }

  const handleOptimize = () => {
    setNyi(true)
    setCalcResults(null)
    setCalcError(null)
  }

  const resolveName = (materialId: string) =>
    materials.find((m) => m.id === materialId)?.name ?? 'Unknown'

  return (
    <div className={styles.container}>
      <h2>Cathode Optimizer</h2>

      <div className={styles.controls}>
        <Select
          label="Cathode"
          id="cathode-select"
          value={selectedCathodeId}
          onChange={(e) => setSelectedCathodeId(e.target.value)}
        >
          {cathodes.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </Select>

        <Button
          variant="primary"
          disabled={!selectedCathode || calcLoading}
          onClick={handleCalculate}
        >
          {calcLoading ? 'Calculating…' : 'Calculate'}
        </Button>

        <Button
          disabled={!selectedCathode}
          onClick={handleOptimize}
        >
          Optimize
        </Button>

        <Button
          disabled={!selectedCathode}
          onClick={() => navigate(`/cathodes?edit=${selectedCathodeId}`)}
        >
          <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            <Pencil size={14} /> Edit
          </span>
        </Button>
      </div>

      {selectedCathode && (
        <div className={styles.summary}>
          <h3>{selectedCathode.name}</h3>
          <div className={styles.compositionRow}>
            <table>
              <thead>
                <tr>
                  <th>Material</th>
                  <th>Mass %</th>
                </tr>
              </thead>
              <tbody>
                {selectedCathode.components.map((comp, i) => (
                  <tr key={i}>
                    <td>
                      <span
                        style={{
                          display: 'inline-block',
                          padding: '0.15rem 0.5rem',
                          borderRadius: '999px',
                          fontSize: '0.78rem',
                          color: contrastText(PIE_COLORS[i % PIE_COLORS.length]),
                          whiteSpace: 'nowrap',
                          background: PIE_COLORS[i % PIE_COLORS.length],
                        }}
                      >
                        {resolveName(comp.materialId)}
                      </span>
                    </td>
                    <td>{comp.massPercent}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <PieChart
              slices={selectedCathode.components.map((comp, i) => ({
                label: resolveName(comp.materialId),
                value: comp.massPercent,
                color: PIE_COLORS[i % PIE_COLORS.length],
              }))}
            />
          </div>
        </div>
      )}

      <div className={styles.results}>
        <h3>Results</h3>
        {calcError && (
          <p className={styles.error}>Error: {calcError}</p>
        )}
        {calcResults && !calcError && (
          calcResults.length > 0 ? (
            <table className={styles.resultsTable}>
              <thead>
                <tr>
                  <th>Material</th>
                  <th>Specific Capacity (mAh/g)</th>
                </tr>
              </thead>
              <tbody>
                {calcResults.map((r, i) => (
                  <tr key={i}>
                    <td>{r.materialName}</td>
                    <td>{r.capacity}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p className={styles.placeholder}>
              No active materials with valency data found in this cathode.
            </p>
          )
        )}
        {nyi && !calcResults && !calcError && (
          <p className={styles.nyi}>
            Optimization is not yet implemented.
          </p>
        )}
        {!calcResults && !calcError && !nyi && (
          <p className={styles.placeholder}>
            Select a cathode and click Calculate to see results.
          </p>
        )}
      </div>
    </div>
  )
}
