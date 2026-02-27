/**
 * Reusable data table wrapper.
 * Use for member list, savings accounts, loan list, etc.
 */
export function DataTable({ columns, data, keyField = 'id' }) {
  return (
    <div className="overflow-x-auto rounded-lg border border-slate-200">
      <table className="min-w-full divide-y divide-slate-200">
        <thead className="bg-slate-50">
          <tr>
            {columns.map((col) => (
              <th
                key={col.key || col.field}
                className="px-4 py-2 text-left text-xs font-medium uppercase tracking-wider text-slate-600"
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-200 bg-white">
          {data?.map((row) => (
            <tr key={row[keyField]}>
              {columns.map((col) => (
                <td key={col.key || col.field} className="whitespace-nowrap px-4 py-2 text-sm text-slate-800">
                  {col.render ? col.render(row[col.field], row) : row[col.field]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default DataTable;
