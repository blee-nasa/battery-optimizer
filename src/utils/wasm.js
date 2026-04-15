let modulePromise = null

async function loadCalculatorModule() {
  if (!window.createCalculatorModule) {
    await new Promise((resolve, reject) => {
      const script = document.createElement('script')
      script.src = import.meta.env.BASE_URL + 'calculator.js'
      script.onload = resolve
      script.onerror = () => reject(new Error('Failed to load calculator.js'))
      document.head.appendChild(script)
    })
  }
  if (!modulePromise) {
    modulePromise = window.createCalculatorModule()
  }
  return modulePromise
}

export async function calculate(n, molecularWeight) {
  const module = await loadCalculatorModule()
  return module.ccall(
    'calculate',
    'number',
    ['number', 'number'],
    [n, molecularWeight]
  )
}
