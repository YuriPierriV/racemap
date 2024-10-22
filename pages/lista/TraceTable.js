import React from 'react';
import DropdownActions from 'pages/lista/DropdownActions';

export default function TraceTable({
  listTrace,
  setDropdownOpen,
  dropdownOpen,
  viewTrace,
  deleteTrace,
  setIsEditing,
  setFormData,
}) {
  const startEdit = (traceId) => {
    const trace = listTrace.find(t => t.id === traceId);
    if (trace) {
      setFormData({
        traceId: trace.id,
        name: trace.name,
        inner_trace: trace.inner_trace,
        outer_trace: trace.outer_trace,
        padding: trace.padding,
        curveintensity: trace.curveintensity,
        rotation: trace.rotation,
      });
      setIsEditing(true);
      setDropdownOpen(null);
    }
  };

  return (
    <div className="w-1/2 pr-4">
      <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400 border-separate border-spacing-y-2">
        <tbody>
          {listTrace.map((trace) => (
            <tr className="bg-slate-800 rounded-lg shadow-md" key={trace.id}>
              <td className="px-6 py-4 font-medium text-white">{trace.name}</td>
              <td className="px-6 py-4 text-gray-400">
                {new Date(trace.created_at).toLocaleString('pt-BR', {
                  day: '2-digit',
                  month: '2-digit',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                  second: '2-digit',
                  hour12: false,
                })}
              </td>
              <td className="px-6 py-4">
                <button
                  onClick={() => viewTrace(trace.id)}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                >
                  Visualizar
                </button>
              </td>
              <td className="px-6 py-4">
                <DropdownActions
                  traceId={trace.id}
                  dropdownOpen={dropdownOpen}
                  setDropdownOpen={setDropdownOpen}
                  startEdit={startEdit}
                  deleteTrace={deleteTrace}
                  viewTrace={viewTrace}
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
