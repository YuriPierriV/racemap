import React, { useEffect, useState, useRef } from 'react';
import { BASE_URL } from 'pages/utils/config';

export default function Lista() {
  const [listTrace, setListTrace] = useState([]);
  const [dropdownOpen, setDropdownOpen] = useState(null); // Estado para controlar dropdowns

  const canvasRef = useRef(null);

  useEffect(() => {
    fetchListTrace();
  }, []);

  const fetchListTrace = async () => {
    try {
      const response = await fetch(`${BASE_URL}/api/v1/getsavedtraces`);
      const data = await response.json();

      // Ajustar o horário subtraindo 3 horas
      const adjustedData = data.map(trace => ({
        ...trace,
        created_at: adjustTimezone(trace.created_at), // Ajusta o horário
      }));

      setListTrace(adjustedData);
    } catch (error) {
      console.error('Erro:', error);
    }
  };

  const adjustTimezone = (createdAt) => {
    // Cria um objeto Date a partir do createdAt
    const date = new Date(createdAt);
    // Subtrai 3 horas em milissegundos (3 * 60 * 60 * 1000)
    date.setHours(date.getHours() - 3);
    return date.toISOString(); // Retorna a data ajustada em formato ISO
  };

  const deleteTrace = async (traceId) => {
    try {
      const response = await fetch(`${BASE_URL}/api/v1/deletetrace`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id: traceId }), // Enviando o ID no corpo da requisição
      });

      if (!response.ok) {
        // Lidar com diferentes códigos de erro
        if (response.status === 404) {
          const errorData = await response.json();
          throw new Error(errorData.error); // Erro se o traço não for encontrado
        }
        const errorData = await response.json();
        throw new Error('Error deleting trace: ' + errorData.error); // Outros erros
      }

      const data = await response.json(); // Obtendo dados de resposta
      console.log(data.message); // Mensagem de sucesso

      // Atualiza a lista local removendo o traçado excluído
      setListTrace((prevList) => prevList.filter((trace) => trace.id !== traceId));

      return data; // Retornando dados, se necessário
    } catch (error) {
      console.error('Error:', error.message); // Lidar com erros de rede ou outros
    }
  };

  const toggleDropdown = (traceId) => {
    setDropdownOpen(dropdownOpen === traceId ? null : traceId); // Alterna entre abrir/fechar o dropdown
  };

  return (
    <main className="bg-slate-700 min-h-screen">
      <div className="container mx-auto p-4">
        <h1 className="text-2xl font-bold text-white mb-5">Lista de Traçados</h1>

        <div className="flex justify-between">
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
                          onClick={() => toggleDropdown(trace.id)}
                          id="dropdownMenuIconButton"
                          className="inline-flex items-center p-2 text-sm font-medium text-center text-gray-900 bg-white rounded-lg hover:bg-gray-100 focus:ring-4 focus:outline-none dark:text-white focus:ring-gray-50 dark:bg-gray-800 dark:hover:bg-gray-700 dark:focus:ring-gray-600"
                          type="button"
                        >
                          <svg className="w-5 h-5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 4 15">
                            <path d="M3.5 1.5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0Zm0 6.041a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0Zm0 5.959a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0Z" />
                          </svg>
                        </button>
                        {dropdownOpen === trace.id && (
                          <div
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
          <div className="w-1/2">
            <canvas
              ref={canvasRef}
              className="border border-black dark:bg-gray-900 h-96 w-full rounded"
              id="tracado"
            />
          </div>
        </div>
      </div>
    </main>
  );
}
