import React, { useEffect, useState } from 'react';
import { BASE_URL } from 'pages/utils/config';

export default function Lista() {
  const [listTrace, setListTrace] = useState([]);

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

  return (
    <main className="bg-slate-700 min-h-screen">
      <div className="container mx-auto p-4">
        <h1 className="text-2xl font-bold text-white mb-5">Lista de Traçados</h1>

        <ul role="list">
          {listTrace.map((trace) => (
            <li key={trace.id} className="flex justify-between gap-x-6 py-5">
              <div className="flex min-w-0 gap-x-4">
                <div className="min-w-0 flex-auto">
                  <p className="text-sm font-semibold leading-6 text-white">
                    {trace.name}
                  </p>
                </div>
              </div>
              <div className="hidden shrink-0 sm:flex sm:flex-col sm:items-end">
                <button
                  className="px-6 py-2 bg-blue-500 text-white rounded-lg mr-3 font-bold transition-all duration-300 transform hover:scale-105 hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
                >
                  Editar
                </button>
                <button
                  onClick={() => deleteTrace(trace.id)}
                  className="px-6 py-2 bg-blue-500 text-white rounded-lg mr-3 font-bold transition-all duration-300 transform hover:scale-105 hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
                >
                  Excluir
                </button>
                <p className="mt-1 text-xs leading-5 text-gray-400">
                  {new Date(trace.created_at).toLocaleString('pt-BR', {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                    second: '2-digit',
                    hour12: false,
                  })}
                </p>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </main>
  );
}
