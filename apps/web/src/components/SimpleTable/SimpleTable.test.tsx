import { render, screen } from '@testing-library/react'
import { SimpleTable } from './SimpleTable'

const sampleData = [
  { name: 'LiFePO4', density: 3.6, category: 'Active Material' },
  { name: 'LGPS', density: 1.95, category: 'Solid Electrolyte' },
]

describe('SimpleTable', () => {
  it('renders without props', () => {
    render(<SimpleTable />)
    expect(screen.getByRole('table')).toBeInTheDocument()
  })

  it('shows "No data" when empty', () => {
    render(<SimpleTable />)
    expect(screen.getByText('No data')).toBeInTheDocument()
  })

  it('derives columns from object keys and renders rows', () => {
    render(<SimpleTable data={sampleData} />)
    expect(screen.getByText('name')).toBeInTheDocument()
    expect(screen.getByText('density')).toBeInTheDocument()
    expect(screen.getByText('LiFePO4')).toBeInTheDocument()
    expect(screen.getByText('1.95')).toBeInTheDocument()
    expect(screen.getAllByRole('row')).toHaveLength(3)
  })

  it('uses columns prop to filter and rename headers', () => {
    render(
      <SimpleTable
        data={sampleData}
        columns={{ name: 'Name', density: 'Density (g/cm³)' }}
      />
    )
    expect(screen.getByText('Name')).toBeInTheDocument()
    expect(screen.getByText('Density (g/cm³)')).toBeInTheDocument()
    expect(screen.queryByText('category')).not.toBeInTheDocument()
    expect(screen.queryByText('Active Material')).not.toBeInTheDocument()
  })

  it('supports render functions for column headers', () => {
    render(
      <SimpleTable
        data={sampleData}
        columns={{ name: () => <em>Material</em> }}
      />
    )
    expect(screen.getByText('Material')).toBeInTheDocument()
    expect(screen.getByText('LiFePO4')).toBeInTheDocument()
    expect(screen.getAllByRole('columnheader')).toHaveLength(1)
  })

  it('renders empty string for missing values', () => {
    const data = [
      { name: 'LiFePO4', valency: 1 },
      { name: 'LGPS' },
    ]
    render(<SimpleTable data={data} columns={{ name: 'Name', valency: 'Valency' }} />)
    const rows = screen.getAllByRole('row')
    const cells = rows[2].querySelectorAll('td')
    expect(cells[1].textContent).toBe('')
  })
})
