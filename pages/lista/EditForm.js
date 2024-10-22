import React from 'react';

export default function EditForm({
  formData,
  setFormData,
  padding,
  setPadding,
  curveIntensity,
  setCurveIntensity,
  rotation,
  setRotation,
  updateTrace,
  setIsEditing,
}) {
  const handleSubmit = (e) => {
    e.preventDefault();

    const updatedData = {
      id: formData.traceId,
      name: formData.name,
      inner_trace: formData.inner_trace,
      outer_trace: formData.outer_trace,
      padding,
      curveintensity: curveIntensity,
      rotation,
    };

    updateTrace(updatedData);
  };

  return (
    <div className="w-1/2 pr-4">
      <form className="bg-slate-800 p-4 rounded shadow-md" onSubmit={handleSubmit}>
        <h2 className="text-xl font-bold text-white mb-2">Editar Traçado</h2>
        <div className="mb-4">
          <label className="block text-gray-300">Nome:</label>
          <input
            type="text"
            name="name"
            value={formData.name || ''}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="border border-gray-600 rounded w-full p-2 bg-slate-900 text-white"
            required
          />
        </div>
        <div className="flex flex-col space-y-4">
          <label className="text-sm font-medium text-gray-300">Ajustar Padding</label>
          <input
            type="range"
            min="0"
            max="300"
            value={padding}
            onChange={(e) => setPadding(Number(e.target.value))}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
          />
          <span className="text-sm font-medium text-blue-700 dark:text-gray-300">Valor atual: {padding}</span>

          <label className="text-sm font-medium text-gray-300">Ajustar Intensidade da Curva</label>
          <input
            type="range"
            min="0"
            max="0.5"
            step="0.01"
            value={curveIntensity}
            onChange={(e) => setCurveIntensity(Number(e.target.value))}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
          />
          <span className="text-sm font-medium text-blue-700 dark:text-gray-300">Valor atual: {curveIntensity}</span>

          <label className="text-sm font-medium text-gray-300">Ajustar Rotação</label>
          <input
            type="range"
            min="0"
            max="360"
            step="1"
            value={rotation}
            onChange={(e) => setRotation(Number(e.target.value))}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
          />
          <span className="text-sm font-medium text-blue-700 dark:text-gray-300">Valor atual: {rotation}</span>
        </div>
        <button
          type="submit"
          className="px-6 py-2 bg-blue-500 text-white rounded-lg mr-3 font-bold transition-all duration-300 transform hover:scale-105 hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
        >
          Salvar
        </button>
        <button
          type="button"
          className="text-sm font-semibold leading-6 text-gray-400"
          onClick={() => setIsEditing(false)}
        >
          Cancelar
        </button>
      </form>
    </div>
  );
}
