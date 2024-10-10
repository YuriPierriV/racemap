import React, { useEffect, useState, useRef } from 'react';
import { BASE_URL } from 'pages/utils/config';
import { drawFull, drawTrace } from 'pages/utils/canvasUtils';

export default function Lista() {
  const [listTrace, setListTrace] = useState([]);
  const [dropdownOpen, setDropdownOpen] = useState(null);
  const [selectedTrace, setSelectedTrace] = useState(null); // Traçado selecionado
  const [outerTrace, setOuterTrace] = useState([]);
  const [innerTrace, setInnerTrace] = useState([]);
  const [padding, setPadding] = useState(50);
  const [curveIntensity, setCurveIntensity] = useState(0.2);

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

    // Ajusta o width inicial
    handleResize();

    // Adiciona o listener para redimensionamento
    window.addEventListener('resize', handleResize);

    // Remove o listener ao desmontar o componente
    return () => window.removeEventListener('resize', handleResize);
  }, []);

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
    // Localiza o traçado com o ID correspondente em listTrace
    const trace = listTrace.find(t => t.id === traceId);

    if (trace) {
      // Extrai os dados necessários
      const { inner_trace, outer_trace, padding, curveIntensity } = trace; // Assumindo que `inner` e `outer` estão armazenados no objeto trace.
      console.log(canvasRef)
      // Chama a função de desenhar com os dados do traçado
      drawFull(canvasRef, inner_trace, outer_trace, padding, curveIntensity);
    } else {
      console.error('Traçado não encontrado:', traceId);
      // Aqui você pode adicionar um tratamento de erro, se necessário
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

      const data = await response.json();
      console.log(data.message);
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
    }
  };

  const viewTrace = (traceId) => {
    fetchTraceDetails(traceId); // Visualiza o traçado no canvas
  };

  return (
    <main className="bg-slate-700 h-screen">
      <div className="container mx-auto p-4 h-full">
        <h1 className="text-2xl font-bold text-white mb-5">Lista de Traçados</h1>

        <div className="flex justify-between h-full">
          <div className="w-1/2 pr-4">
            <table className="w-full text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400">
              <tbody>
                {listTrace.map((trace) => (
                  <tr className="odd:bg-white odd:dark:bg-gray-900 even:bg-gray-50 even:dark:bg-gray-800 border-b dark:border-gray-700" key={trace.id}>
                    <td className="md:px-6 px-2 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white">
                      {trace.name}
                    </td>
                    <td className="md:px-6 px-2 py-4">
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
                    <td className="md:px-6 px-2 py-4">
                      <div className="relative">
                        <button
                          ref={buttonRef}
                          onClick={() => toggleDropdown(trace.id)}
                          id="dropdownMenuIconButton"
                          className="inline-flex items-center p-2 text-sm font-medium text-center text-gray-900 rounded-lg dark:text-white hover:text-white"
                          type="button"
                        >
                          <svg className="w-5 h-5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 4 15">
                            <path d="M3.5 1.5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0Zm0 6.041a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0Zm0 5.959a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0Z" />
                          </svg>
                        </button>
                        {dropdownOpen === trace.id && (
                          <div
                            ref={dropdownRef}
                            id="dropdownDots"
                            className="absolute right-0 z-10 bg-white divide-y divide-gray-100 rounded-lg shadow w-44 dark:bg-gray-700 dark:divide-gray-600"
                          >
                            <ul className="py-2 text-sm text-gray-700 dark:text-gray-200" aria-labelledby="dropdownMenuIconButton">
                              <div className="py-2">
                                <button
                                  className="block w-full px-4 py-2 text-sm text-left text-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 dark:text-gray-200 dark:hover:text-white"
                                >
                                  Editar
                                </button>
                                <button
                                  onClick={() => deleteTrace(trace.id)}
                                  className="block w-full px-4 py-2 text-sm text-left text-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 dark:text-gray-200 dark:hover:text-white"
                                >
                                  Excluir
                                </button>
                                <button
                                  onClick={() => viewTrace(trace.id)} // Botão "Visualizar"
                                  className="block w-full px-4 py-2 text-sm text-left text-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 dark:text-gray-200 dark:hover:text-white"
                                >
                                  Visualizar
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
          <div className="w-1/2 h-full">
            <canvas
              ref={canvasRef}
              className={`border border-black dark:bg-gray-900 h-3/4 w-full rounded 2xl:h-2/5`}
              id="tracado"
            />
          </div>
        </div>
      </div>

    </main>
  );
}
