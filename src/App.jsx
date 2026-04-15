import { useState } from 'react'
import './App.css'

function App() {
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  async function runCalculation() {
    setLoading(true)
    setError(null)
    try {
      // calculator.js is an Emscripten glue file in public/, served as a
      // static asset. Load it at runtime rather than bundling it.
      if (!window.createCalculatorModule) {
        await new Promise((resolve, reject) => {
          const script = document.createElement('script')
          script.src = import.meta.env.BASE_URL + 'calculator.js'
          script.onload = resolve
          script.onerror = () => reject(new Error('Failed to load calculator.js'))
          document.head.appendChild(script)
        })
      }
      const module = await window.createCalculatorModule()
      const n = 1.0
      const molecularWeight = 151.91 // LiFePO4
      const capacity = module.ccall(
        'calculate',
        'number',
        ['number', 'number'],
        [n, molecularWeight]
      )
      setResult({
        n,
        molecularWeight,
        capacity: capacity.toFixed(2),
      })
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="app">
      <h1>Battery Optimizer</h1>
      <p>Proof of concept - React + WebAssembly (C via Emscripten)</p>

      <button onClick={runCalculation} disabled={loading}>
        {loading ? 'Calculating...' : 'Calculate Specific Capacity'}
      </button>

      {error && <p className="error">Error: {error}</p>}

      {result && (
        <div className="result">
          <h2>Result</h2>
          <table>
            <tbody>
              <tr>
                <td>Material</td>
                <td>LiFePO4 (stub)</td>
              </tr>
              <tr>
                <td>Electrons transferred (n)</td>
                <td>{result.n}</td>
              </tr>
              <tr>
                <td>Molecular weight</td>
                <td>{result.molecularWeight} g/mol</td>
              </tr>
              <tr>
                <td>Specific capacity</td>
                <td>{result.capacity} mAh/g</td>
              </tr>
            </tbody>
          </table>
          <p className="note">
            Calculated via WASM: C = (n * F) / (M * 3.6)
          </p>
        </div>
      )}
    </div>
  )
}

export default App
