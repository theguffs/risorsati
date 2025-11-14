import './DataTable.css'

export const DataTable = ({ columns, data, loading, onRowClick }) => {
  if (loading) {
    return (
      <div className="table-loading">
        <p>Caricamento dati...</p>
      </div>
    )
  }

  if (!data || data.length === 0) {
    return (
      <div className="table-empty">
        <p>Nessun dato disponibile</p>
      </div>
    )
  }

  return (
    <div className="table-container">
      <table className="data-table">
        <thead>
          <tr>
            {columns.map((col) => (
              <th key={col.key}>{col.label}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, index) => (
            <tr
              key={row.id || index}
              onClick={() => onRowClick && onRowClick(row)}
              className={onRowClick ? 'clickable' : ''}
            >
              {columns.map((col) => (
                <td key={col.key}>
                  {col.render
                    ? col.render(row[col.key], row)
                    : row[col.key] ?? '-'}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}




