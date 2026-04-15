import { useState } from 'react'
import { calculate } from './utils/wasm'
import './App.css'

const DEFAULT_RESULT = {
  n: '',
  molecularWeight: '',
  capacity: '',
}

export const App = () => {
  const [n, setN] = useState('1')
  const [molecularWeight, setMolecularWeight] = useState('151.91')
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

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
      await new Promise((resolve) => setTimeout(resolve, 1000))
      setResult({
        n: nVal,
        molecularWeight: mwVal,
        capacity: capacity.toFixed(2),
      })
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const displayResult = result || DEFAULT_RESULT;

  return (
    <div className="app">
      <h1>Battery Optimizer</h1>
      <p>Proof of concept - React + WebAssembly (C via Emscripten)</p>

      <div className="inputs">
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

      <p className="error" style={{ opacity: error ? 1 : 0 }}>Error: {error}</p>

      <div className="result" style={{ opacity: loading ? 0.7 : 1 }}>
        <div style={{ opacity: result ? 1 : 0 }}>
          <h2>{loading ? 'Calculating ...' : 'Result'}</h2>
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
          <p className="note" style={{ opacity: loading ? 0 : 1 }}>
            Calculated via WASM: C = (n * F) / (M * 3.6)
          </p>
        </div>
      </div>
    </div>
  )
}
