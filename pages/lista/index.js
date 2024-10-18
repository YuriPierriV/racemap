import React, { useEffect, useState, useRef } from 'react';
import { BASE_URL } from 'pages/utils/config';
import { drawFull } from 'pages/utils/canvasUtils';

export default function Lista() {
  const [listTrace, setListTrace] = useState([]);
  const [dropdownOpen, setDropdownOpen] = useState(null);
  const [selectedTrace, setSelectedTrace] = useState(null);
  const [outerTrace, setOuterTrace] = useState([]);
  const [innerTrace, setInnerTrace] = useState([]);
  const [padding, setPadding] = useState(50);
  const [curveIntensity, setCurveIntensity] = useState(0.2);
  const [rotation, setRotation] = useState(0);
  
  const [isEditing, setIsEditing] = useState(false); // Controle do modo de edição
  const [formData, setFormData] = useState({}); // Dados do formulário

  const canvasRef = useRef(null);
  const dropdownRef = useRef(null);
  const buttonRef = useRef(null);

  useEffect(() => {
    fetchListTrace();
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        dropdownRef.current &&
        buttonRef.current &&
        !dropdownRef.current.contains(event.target) &&
        !buttonRef.current.contains(event.target)
      ) {
        setDropdownOpen(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  useEffect(() => {
    const handleResize = () => {
      if (canvasRef.current) {
        canvasRef.current.width = canvasRef.current.offsetWidth;
        canvasRef.current.height = canvasRef.current.offsetHeight;
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);

    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Atualiza a pista no canvas toda vez que padding, curveIntensity ou rotation mudam
  useEffect(() => {
    if (innerTrace.length > 0 && outerTrace.length > 0) {
      drawFull(canvasRef, innerTrace, outerTrace, padding, curveIntensity, rotation);
    }
  }, [padding, curveIntensity, rotation, innerTrace, outerTrace]);

  const fetchListTrace = async () => {
    try {
      const response = await fetch(`${BASE_URL}/api/v1/getsavedtraces`);
      const data = await response.json();
      const adjustedData = data.map(trace => ({
        ...trace,
        created_at: adjustTimezone(trace.created_at),
      }));
      setListTrace(adjustedData);
    } catch (error) {
      console.error('Erro:', error);
    }
  };

  const adjustTimezone = (createdAt) => {
    const date = new Date(createdAt);
    date.setHours(date.getHours() - 3);
    return date.toISOString();
  };

  const fetchTraceDetails = (traceId) => {
    const trace = listTrace.find(t => t.id === traceId);

    if (trace) {
      const { inner_trace, outer_trace, padding, curveIntensity, rotation } = trace;
      setInnerTrace(inner_trace);
      setOuterTrace(outer_trace);
      setPadding(padding);
      setCurveIntensity(curveIntensity);
      setRotation(rotation);
    } else {
      console.error('Traçado não encontrado:', traceId);
    }
  };

  const deleteTrace = async (traceId) => {
    try {
      const response = await fetch(`${BASE_URL}/api/v1/deletetrace`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id: traceId }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error('Erro ao deletar traçado: ' + errorData.error);
      }

      setListTrace((prevList) => prevList.filter((trace) => trace.id !== traceId));
      setSelectedTrace(null);
      setOuterTrace([]);
      setInnerTrace([]);
    } catch (error) {
      console.error('Erro:', error.message);
    }
  };

  const toggleDropdown = (traceId) => {
    setDropdownOpen(dropdownOpen === traceId ? null : traceId);
    if (dropdownOpen !== traceId) {
      setIsEditing(false); // Fechar o modo de edição ao abrir um novo dropdown
      setFormData({}); // Limpar os dados do formulário
    }
  };

  const viewTrace = (traceId) => {
    fetchTraceDetails(traceId);
  };

  const startEdit = (traceId) => {
    const trace = listTrace.find(t => t.id === traceId);
    if (trace) {
      setFormData({
        traceId: trace.id,
        name: trace.name,
        inner_trace: trace.inner_trace,
        outer_trace: trace.outer_trace,
        padding: trace.padding,
        curveintensity: trace.curveIntensity,
        rotation: trace.rotation,
      });
      setInnerTrace(trace.inner_trace);
      setOuterTrace(trace.outer_trace);
      setPadding(trace.padding);
      setCurveIntensity(trace.curveintensity);
      setRotation(trace.rotation);
      setIsEditing(true);
      setDropdownOpen(null);
    }
  };

  const updateTrace = async (e) => {
    e.preventDefault();
    
    try {
      // Envia os novos dados para a API via PUT
      const response = await fetch(`${BASE_URL}/api/v1/edittrace`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: formData.traceId,  // Certifique-se de que o ID do traçado esteja sendo enviado
          name: formData.name,
          inner_trace: innerTrace,  // Pega as variáveis atuais de inner/outerTrace
          outer_trace: outerTrace,
          padding: padding,
          curveintensity: curveIntensity,
          rotation: rotation,
        }),
      });
      console.log(formData)
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error('Erro ao atualizar traçado: ' + errorData.error);
      }
  
      const updatedTrace = await response.json(); 
  
      setListTrace((prevList) =>
        prevList.map((trace) =>
          trace.id === updatedTrace.id
            ? {
                ...trace,
                name: formData.name,
                inner_trace: innerTrace,
                outer_trace: outerTrace,
                padding: padding,
                curveintensity: curveIntensity,
                rotation: rotation,
              }
            : trace
        )
      );
  

      setIsEditing(false);
      setFormData({});
    } catch (error) {
      console.error('Erro:', error.message);
    }
  };

  return (
    <main className="bg-slate-700 h-screen">
      <div className="container mx-auto p-4 h-full">
        <h1 className="text-2xl font-bold text-white mb-5">Lista de Traçados</h1>

        <div className="flex justify-between h-full">
          {!isEditing ? (
            <div className="w-1/2 pr-4">
              <table className="w-full text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400 border-separate border-spacing-y-2">
                <tbody>
                  {listTrace.map((trace) => (
                    <tr className="bg-slate-800 rounded-lg shadow-md" key={trace.id}>
                      <td className="px-6 py-4 font-medium text-white">
                        {trace.name}
                      </td>
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
                        <div className="relative">
                          <button
                            ref={buttonRef}
                            onClick={() => toggleDropdown(trace.id)}
                            className="inline-flex items-center p-2 text-sm font-medium text-gray-900 rounded-lg dark:text-white hover:text-white"
                            type="button"
                          >
                            <svg className="w-5 h-5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 4 15">
                              <path d="M3.5 1.5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0Zm0 6.041a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0Zm0 5.959a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0Z" />
                            </svg>
                          </button>

                          {dropdownOpen === trace.id && (
                            <div
                              ref={dropdownRef}
                              className="absolute right-0 mt-2 w-28 rounded-md shadow-lg bg-gray-800"
                            >
                              <ul>
                                <div>
                                  <button
                                    onClick={() => startEdit(trace.id)}
                                    className="block w-full px-4 py-2 text-left hover:bg-gray-700"
                                  >
                                    Editar
                                  </button>
                                  <button
                                    onClick={() => deleteTrace(trace.id)}
                                    className="block w-full px-4 py-2 text-left hover:bg-gray-700"
                                  >
                                    Excluir
                                  </button>
                                </div>
                              </ul>
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="w-1/2 pr-4">
              <form className="bg-slate-800 p-4 rounded shadow-md">
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
                    max="100"
                    value={padding}
                    onChange={(e) => setPadding(Number(e.target.value))}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
                  />
                  <span className="text-sm font-medium text-blue-700 dark:text-gray-300">
                    Valor atual: {padding}
                  </span>

                  <label className="text-sm font-medium text-gray-300">Ajustar Intensidade da Curva</label>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.01"
                    value={curveIntensity}
                    onChange={(e) => setCurveIntensity(Number(e.target.value))}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
                  />
                  <span className="text-sm font-medium text-blue-700 dark:text-gray-300">
                    Valor atual: {curveIntensity}
                  </span>

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
                  <span className="text-sm font-medium text-blue-700 dark:text-gray-300">
                    Valor atual: {rotation}
                  </span>
                </div>
                <button
                  type="button" // Mudei de submit para button
                  onClick={updateTrace} // Chama a função diretamente no clique
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
          )}

          <div className="w-1/2 h-full">
            <canvas
              ref={canvasRef}
              className="border border-black dark:bg-gray-900 h-3/4 w-full rounded 2xl:h-2/5"
              id="tracado"
            />
          </div>
        </div>
      </div>
    </main>
  );
}
