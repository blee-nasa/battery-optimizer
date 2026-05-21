import { useState } from 'react'
import { calculate } from '@utils'
import styles from './CapacityCalculatorConcept.module.css'

interface Result {
  n: number
  molecularWeight: number
  capacity: string
}

const DEFAULT_RESULT = {
  n: '',
  molecularWeight: '',
  capacity: '',
}

export const CapacityCalculatorConcept = () => {
  const [n, setN] = useState('1')
  const [molecularWeight, setMolecularWeight] = useState('151.91')
  const [result, setResult] = useState<Result | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function runCalculation() {
    setLoading(true)
    setError(null)
    try {
      const nVal = parseInt(n, 10)
      const mwVal = parseFloat(molecularWeight)
      if (isNaN(nVal) || nVal <= 0 || !Number.isInteger(nVal)) {
        throw new Error('Electrons transferred must be a positive integer')
      }
      if (isNaN(mwVal) || mwVal <= 0) {
        throw new Error('Molecular weight must be a positive number')
      }
      const capacity = await calculate(nVal, mwVal)
      setResult({
        n: nVal,
        molecularWeight: mwVal,
        capacity: capacity.toFixed(2),
      })
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setLoading(false)
    }
  }

  const displayResult = result || DEFAULT_RESULT;

  return (
    <div className={styles.app}>
      <h2>Proof of Concept — WASM Capacity Calculator</h2>

      <div className={styles.inputs}>
        <label>
          Electrons transferred (n)
          <input type="number" step="1" min="1" value={n} onChange={(e) => setN(e.target.value)} />
        </label>
        <label>
          Molecular weight (g/mol)
          <input type="number" step="any" value={molecularWeight} onChange={(e) => setMolecularWeight(e.target.value)} />
        </label>
      </div>

      <button onClick={runCalculation} disabled={loading} style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', justifySelf: 'center' }}>
        <span style={{ opacity: loading ? 1 : 0, position: 'absolute' }}>Calculating...</span>
        <span style={{ opacity: loading ? 0 : 1 }}>Calculate Specific Capacity</span>
      </button>

      <p className={styles.error} style={{ opacity: error ? 1 : 0 }}>Error: {error}</p>

      <div className={styles.result} style={{ opacity: loading ? 0.7 : 1 }}>
        <div style={{ opacity: result ? 1 : 0 }}>
          <h3>{loading ? 'Calculating ...' : 'Result'}</h3>
          <table>
            <tbody>
              <tr>
                <td>Material</td>
                <td>LiFePO4 (stub)</td>
              </tr>
              <tr>
                <td>Electrons transferred (n)</td>
                <td>{loading ? 'Calculating ...' : displayResult.n}</td>
              </tr>
              <tr>
                <td>Molecular weight</td>
                <td>{loading ? 'Calculating ...' : `${displayResult.molecularWeight} g/mol`}</td>
              </tr>
              <tr>
                <td>Specific capacity</td>
                <td>{loading ? 'Calculating ...' : `${displayResult.capacity} mAh/g`}</td>
              </tr>
            </tbody>
          </table>
          <p className={styles.note} style={{ opacity: loading ? 0 : 1 }}>
            Calculated via WASM: C = (n * F) / (M * 3.6)
          </p>
        </div>
      </div>
    </div>
  )
}
