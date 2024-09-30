import mqtt from 'mqtt';
import React, { useEffect, useState, useRef } from 'react';
import { connectUrl, options } from 'infra/mqttConfig.js';
import { haversineDistance } from './constants/functions';


const MqttPage = () => {
  const [messages, setMessages] = useState([]); //historico das mensagens do gps
  const [buffer, setBuffer] = useState([]); //lista das ultimas "5" ultimas posições na hora de criar um traçado, buffer para media
  const [trace, setTrace] = useState([]); //lista de posições quando criar traçado
  const [confirmationPlace, setConfirmationPlace] = useState({ lat: 0, long: 0 });



  const [connection, setConnection] = useState(false); //vizualização da conexão com o mqtt
  const [client, setClient] = useState(null); // conexão em si do mqtt

  const [mode, setMode] = useState("0"); //modo do gps


  const latMin = useRef(Infinity);
  const latMax = useRef(-Infinity);
  const longMin = useRef(Infinity);
  const longMax = useRef(-Infinity);
  const [scale, setScale] = useState({ scaleX: 1, scaleY: 1 }); //escala do mapa


  const [savedTraces, setSavedTraces] = useState([]); //Lista de todos os traçados salvos no banco de dados
  const [selectedTrace, setSelectedTrace] = useState(null); // Traçado selecionado

  const [status, setStatus] = useState("aguardando"); //status da criação: aguardando,iniciado,externo,interno,finalização


  const canvasRef = useRef(null);
  const BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:3000";

  useEffect(() => {
    const mqttClient = mqtt.connect(connectUrl, options);
    setClient(mqttClient);

    mqttClient.on('connect', () => {

      mqttClient.subscribe("kart", { qos: 2 }, (err) => {
        setConnection(true);
        if (err) {
          console.error('Failed to subscribe:', err);
        }
      });
    });

    mqttClient.on('error', (err) => {
      console.error('Connection error:', err);
      setConnection(false);
    });

    mqttClient.on('close', () => {
      console.log('Connection closed');
      setConnection(false);
    });

    return () => {
      mqttClient.end();
    };
  }, []);


  // vai recebendo 
  useEffect(() => {
    if (client) {
      client.on('message', (topic, payload) => {
        const message = JSON.parse(payload.toString());
        setMessages(prevMessages => { //prevMessages é a lista de mensagens anterior
          const updatedMessages = [message, ...prevMessages]; //lista com a mensagem nova
          return updatedMessages.slice(0, 10); //mensagens vai virar
        });
      });
    };

  }, [client]);

  // Cria as listas de buffer e trace
  useEffect(() => {
    if (status === "iniciando") {
      if (messages.length > 9 && mode !== "0") {
        setConfirmationPlace(avgPlace(messages))
        sendMode("0");
        setStatus("iniciando");
      }
    }
    if (mode === "Criando traçado") {
      const position = { lat: messages[0].lat, long: messages[0].long };

      setBuffer(prevBuffer => {
        let updatedTraces; // Variável que vai armazenar as novas posições atualizadas

        // Verifica se a lista de traçados anteriores (prevBuffer) tem menos que 5 posições
        if (prevBuffer.length < 10) {
          // Se a lista estiver vazia, simplesmente retorna a nova posição como a primeira posição da lista
          if (prevBuffer.length == 0) {
            return [position];
          }

          // Se a lista de traçados anteriores tiver algum item

          if (trace.length > 0) {

            const lastPositionTrace = trace[0]; // Pega a última posição registrada em 'trace'


            // Calcula a distância entre a última posição de 'trace' e a nova posição 'position'
            const distanceFive = haversineDistance(lastPositionTrace.lat, lastPositionTrace.long, position.lat, position.long);

            // Se a distância for menor que 4 metros, a nova posição será adicionada
            if (distanceFive > 0 && distanceFive < 50) {

              updatedTraces = [position, ...prevBuffer]; // Adiciona a nova posição no início da lista de traçados anteriores
              return updatedTraces; // Retorna a lista atualizada
            }

            // Se a distância for maior que 4 metros, retorna a lista anterior sem alterações

            return prevBuffer;
          } else {
            // Caso a lista nao tenha posições, adiciona a nova posição diretamente
            updatedTraces = [position, ...prevBuffer];

            return updatedTraces; // Retorna a lista atualizada
          }
        } else {
          // Caso a lista de traçados anteriores já tenha 5 posições, adiciona a nova posição
          updatedTraces = [position, ...prevBuffer]; // Mantém apenas as 5 posições mais recentes
          // Calcula a média das latitudes e longitudes das 5 últimas posições

          const avgPosition = avgPlace(updatedTraces);



          // Atualiza a lista 'trace' com base na distância entre a última posição e a média calculada
          setTrace(prevTrace => {

            if (prevTrace.length > 0) {
              const lastPosition = prevTrace[0]; // Pega a última posição registrada em 'trace'

              // Calcula a distância entre a última posição e a média das 5 últimas posições
              const distance = haversineDistance(lastPosition.lat, lastPosition.long, avgPosition.lat, avgPosition.long);

              // Se a distância for maior que 2 metros e menor que 4 metros, adiciona a média à lista de traçados
              if (distance > 0) {


                return [avgPosition, ...prevTrace]; // Adiciona a média ao início da lista de 'trace'
              }

              return prevTrace;
            } else {
              // Se 'trace' estiver vazio, adiciona a nova posição média como o primeiro item
              return [avgPosition];
            }
          });


          return [];
        }
      });
    }
  }, [messages]);

  useEffect(() => {
    const fetchSavedTraces = async () => {
      try {
        const response = await fetch(`${BASE_URL}/api/v1/getsavedtraces`);
        if (!response.ok) {
          throw new Error('Failed to fetch saved traces');
        }
        const data = await response.json();
        setSavedTraces(data);
      } catch (error) {
        console.error('Error fetching saved traces:', error);
      }
    };

    fetchSavedTraces();
  }, [selectedTrace]);

  useEffect(() => {
    const draw = () => {
      let traceToDraw = trace;

      if (selectedTrace) {
        traceToDraw = selectedTrace; // Use o traçado selecionado
      }

      if (traceToDraw.length > 0) {

        drawTrace(traceToDraw); // Desenha o traçado
      }
    };

    draw(); // Chama a função de desenho

  }, [selectedTrace]); // Dependências que devem acionar a atualização

  useEffect(() => {
    if (trace.length > 0) {
      // Atualiza os valores mínimos e máximos diretamente no useRef
      latMin.current = Math.min(latMin.current, trace[0].lat);
      latMax.current = Math.max(latMax.current, trace[0].lat);
      longMin.current = Math.min(longMin.current, trace[0].long);
      longMax.current = Math.max(longMax.current, trace[0].long);

      const newScaleX = canvasRef.current.width / (longMax.current - longMin.current);
      const newScaleY = canvasRef.current.height / (latMax.current - latMin.current);

      setScale({ scaleX: newScaleX, scaleY: newScaleY });

      // Chama drawTrace usando os valores de referência
      drawTrace(trace);
    } else {
      latMin.current = Infinity;
      latMax.current = -Infinity;
      longMin.current = Infinity;
      longMax.current = -Infinity;

      drawTrace(trace);
    }
  }, [trace]);  // Dependências que devem acionar a atualização


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




  const drawTrace = (positions) => {
    const canvas = canvasRef.current;

    const ctx = canvas.getContext('2d');

    ctx.clearRect(0, 0, canvas.width, canvas.height);



    if (positions.length === 0) return;

    if (positions.length > 3) {
      positions = positions.slice(0, positions.length - 3); // Mantém todas as posições, exceto as 3 últimas
    }

    const padding = 50; // Define o padding de 20px

    // Calcula novas escalas considerando o padding
    const adjustedScaleX = (canvas.width - 2 * padding) / (longMax.current - longMin.current);
    const adjustedScaleY = (canvas.height - 2 * padding) / (latMax.current - latMin.current);

    ctx.beginPath();
    positions.forEach((pos, index) => {

      // Ajusta as coordenadas com o padding
      const x = (pos.long - longMin.current) * adjustedScaleX + padding;
      const y = canvas.height - ((pos.lat - latMin.current) * adjustedScaleY + padding); // O canvas inverte o eixo Y, então usamos height
      if (index === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    });

    ctx.strokeStyle = 'blue';
    ctx.lineWidth = 1;
    ctx.stroke();

    // Desenha pontos
    positions.forEach((pos) => {
      // Ajusta as coordenadas dos pontos com o padding
      const x = (pos.long - longMin.current) * adjustedScaleX + padding;
      const y = canvas.height - ((pos.lat - latMin.current) * adjustedScaleY + padding);

      ctx.beginPath();
      ctx.arc(x, y, 2, 0, Math.PI * 2);
      ctx.fillStyle = 'red';
      ctx.fill();
    });
  };





  const sendMode = (newMode) => {
    if (client) {
      setMode(prevMode => {
        return newMode
      });
      client.publish('config', newMode, { qos: 2 }, (err) => {
        if (err) {
          console.error('Failed to publish:', err);
        }
      });
    }
  };

  const startTrace = () => {
    setStatus("iniciando");
    sendMode("1");
  };

  const avgPlace = (lista) => {
    // Calcula a média das latitudes e longitudes das 5 últimas posições
    const totalLat = lista.reduce((acc, trace) => acc + trace.lat, 0); // Soma todas as latitudes
    const totalLng = lista.reduce((acc, trace) => acc + trace.long, 0); // Soma todas as longitudes

    const avgLat = totalLat / lista.length; // Calcula a média da latitude
    const avgLng = totalLng / lista.length; // Calcula a média da longitude

    const avgPosition = { lat: avgLat, long: avgLng }; // Cria uma nova posição média usando as médias de latitude e longitude
    console.log(avgPosition);
    console.log(lista);
    return avgPosition
  }




  const saveTrace = () => {
    if (client) {
      setMode("0");
      client.publish('config', "0", { qos: 2 }, (err) => {
        if (err) {
          console.error('Failed to publish:', err);
        }
      });

      fetch(`${BASE_URL}/api/v1/savetrace`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(trace),
      })
        .then((response) => {
          if (!response.ok) {
            throw new Error("Failed to save trace");
          }
          return response.json();
        })
        .then((data) => {
          console.log("Trace saved successfully:", data);
          //selectTrace(data.trackId);
        })
        .catch((error) => {
          console.error("Error saving trace:", error);
        });
    }
  };

  const selectTrace = (position) => {


    if (position.length > 0) {
      const newLatMin = Math.min(...position.map(pos => pos.lat));
      const newLatMax = Math.max(...position.map(pos => pos.lat));
      const newLongMin = Math.min(...position.map(pos => pos.long));
      const newLongMax = Math.max(...position.map(pos => pos.long));

      setLatMin(newLatMin);
      setLatMax(newLatMax);
      setLongMin(newLongMin);
      setLongMax(newLongMax);

      const newScaleX = canvasRef.current.width / (newLongMax - newLongMin);
      const newScaleY = canvasRef.current.height / (newLatMax - newLatMin);

      setScale({ scaleX: newScaleX, scaleY: newScaleY });
    }

    setSelectedTrace(position);
  };

  const cancelTrace = () => {
    sendMode("0");
    setStatus("aguardando");
    setTrace([]);
    setBuffer([]);
  }



  return (
    <main className="bg-slate-700">
      <div className="grid 2xl:grid-cols-2 gap-5 p-4 bg-slate-700 min-h-screen container mx-auto">
        <div>
          <div className={`flex items-center p-4 mb-4 w-min text-sm border rounded-lg ${connection ? 'text-green-800 border-green-300 bg-green-50 dark:bg-gray-800 dark:text-green-400 dark:border-green-800' : 'text-red-800 border-red-300 bg-red-50 dark:bg-gray-800 dark:text-red-400 dark:border-red-800'}`} role="alert">
            {connection ? (
              <svg className="flex-shrink-0 inline w-4 h-4 me-3" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
                <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.5 11.5 11 14l4-4m6 2a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
              </svg>
            ) : (
              <svg className="flex-shrink-0 inline w-4 h-4 me-3" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
                <path stroke="currentColor" strokeLinecap="round" strokeWidth="2" d="m6 6 12 12m3-6a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
              </svg>
            )}
            <span className="sr-only">Connection</span>
            <div>
              <span className="font-medium">{connection ? "Conectado" : "Conectando"}</span>
            </div>
          </div>

          {status !== 'aguardando' ? (
            <div>
              <form>
                <div className="space-y-12">
                  <div className="border-b border-gray-900/10 pb-12">
                    <div className="mt-5  grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6">
                      <div className="sm:col-span-2">
                        <h2 className="text-base font-semibold leading-7 text-white">Inicie um traçado</h2>
                        <p className="mt-1 text-sm leading-6 text-slate-400">Tenha um GPS conectado</p>
                      </div>
                      <div className="sm:col-span-4">

                        <ol className="flex justify-center items-center w-full p-3 space-x-2 text-sm font-medium text-center text-gray-500 bg-white border border-gray-200 rounded-lg shadow-sm dark:text-gray-400 sm:text-base dark:bg-gray-800 dark:border-gray-700 sm:p-4 sm:space-x-4 rtl:space-x-reverse">
                          <li className="flex items-center text-blue-600 dark:text-blue-500">
                            <span className="flex items-center justify-center w-5 h-5 me-2 text-xs border border-blue-600 rounded-full shrink-0 dark:border-blue-500">
                              1
                            </span>
                            Externo
                            <svg className="w-3 h-3 ms-2 sm:ms-4 rtl:rotate-180" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 12 10">
                              <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m7 9 4-4-4-4M1 9l4-4-4-4" />
                            </svg>
                          </li>
                          <li className="flex items-center">
                            <span className="flex items-center justify-center w-5 h-5 me-2 text-xs border border-gray-500 rounded-full shrink-0 dark:border-gray-400">
                              2
                            </span>
                            Interno
                            <svg className="w-3 h-3 ms-2 sm:ms-4 rtl:rotate-180" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 12 10">
                              <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m7 9 4-4-4-4M1 9l4-4-4-4" />
                            </svg>
                          </li>
                          <li className="flex items-center">
                            <span className="flex items-center justify-center w-5 h-5 me-2 text-xs border border-gray-500 rounded-full shrink-0 dark:border-gray-400">
                              3
                            </span>
                            Ajustes
                          </li>
                        </ol>


                      </div>

                    </div>


                    <div className="mt-5  grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6 dark:bg-gray-800 dark:border-gray-700 sm:p-4 sm:space-x-4 rtl:space-x-reverse p-3 space-x-2 text-sm font-medium text-gray-500 bg-white border border-gray-200 rounded-lg shadow-sm">
                      <div className="sm:col-span-full">
                        <label className="block text-sm font-medium leading-6 text-white ">
                          Nome do traçado
                        </label>
                        <div className="mt-2">
                          <input
                            id="kartname"
                            name="kartname"
                            type="text"
                            autoComplete="kartname"
                            className="block w-full rounded-md border-0 py-1.5 px-4 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-0 focus:ring-inset focus:ring-blue-800 sm:text-sm sm:leading-6"
                          />
                        </div>
                      </div>
                      <div className="sm:col-span-full mt-3">
                        <div className="flex items-start">
                          <input
                            id="confirmPosition"
                            name="confirmPosition"
                            type="checkbox"
                            className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-600"
                          />
                          <label htmlFor="confirmPosition" className="ml-3 block text-sm leading-6 text-white">
                            Confirmo a posição inicial
                          </label>
                        </div>
                      </div>

                      {/* Embed do mapa */}
                      <div className="sm:col-span-full mt-4">
                        <label className="block text-sm font-medium leading-6 text-white">
                          Mapa da Posição
                        </label>
                        <div className="mt-2">
                          {/* adicionar iframe */}



                        </div>
                      </div>
                      <div className="mt-3 sm:col-span-full mx-10 flex items-center justify-end gap-x-6">
                        <button type="button" className="text-sm font-semibold leading-6 text-gray-400" onClick={() => cancelTrace()}>
                          Cancelar
                        </button>
                        <button
                          type="submit"
                          className="rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
                        >
                          Iniciar
                        </button>
                      </div>
                    </div>

                  </div>
                </div>


              </form>
            </div>
          ) : (
            <div>
              <h2 className="text-2xl font-bold mb-4">Histórico:</h2>

              <div className="relative overflow-x-auto shadow-md sm:rounded-lg">
                <table className="w-full text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400">
                  <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                    <tr>
                      <th scope="col" className="px-6 py-3">
                        Device ID
                      </th>
                      <th scope="col" className="px-6 py-3">
                        Latitude
                      </th>
                      <th scope="col" className="px-6 py-3">
                        Longitude
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {messages.map((message, index) => (
                      <tr className="odd:bg-white odd:dark:bg-gray-900 even:bg-gray-50 even:dark:bg-gray-800 border-b dark:border-gray-700">
                        <th scope="row" className="md:px-6 px-2 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white">
                          {message.deviceId}
                        </th>
                        <td className="md:px-6 px-2 py-4">
                          {message.lat}
                        </td>
                        <td className="md:px-6 px-2 py-4">
                          {message.long}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}


        </div>

        <div>
          <div className="mb-4 mt-4">
            <h3 className="text-xl font-semibold mb-2">Modo:</h3>
            <button
              onClick={() => sendMode('0')}
              disabled={!connection || mode === 'Criando traçado'}
              className="px-4 py-2 bg-red-500 text-white rounded mr-2 disabled:opacity-50 font-bold"
            >
              Off
            </button>
            <button
              onClick={() => sendMode('1')}
              disabled={!connection || mode === 'Criando traçado'}
              className="px-4 py-2 bg-green-500 text-white rounded mr-2 disabled:opacity-50 font-bold"
            >
              On
            </button>
            <button
              onClick={startTrace}
              disabled={!connection || mode === 'Criando traçado'}
              className="px-4 py-2 bg-blue-500 text-white rounded mr-2 disabled:opacity-50 font-bold"
            >
              Criar traçado
            </button>

          </div>

          <h3 className="text-xl font-semibold mb-2">Traces:</h3>
          <ul role="list" className="divide-y divide-gray-100">
            {savedTraces.map((trace, index) => (
              <li className="flex justify-between gap-x-6 py-5">
                <div className="flex min-w-0 gap-x-4">

                  <div className="min-w-0 flex-auto">
                    <p className="text-sm font-semibold leading-6 text-gray-900">{trace.id}</p>
                    <p className="mt-1 truncate text-xs leading-5 text-gray-500">{trace.name}</p>
                  </div>
                </div>
                <div className="hidden shrink-0 sm:flex sm:flex-col sm:items-end">
                  <p className="text-sm leading-6 text-gray-900">Co-Founder / CEO</p>
                  <p className="mt-1 text-xs leading-5 text-gray-500">Last seen <time datetime="2023-01-23T13:23Z">{trace.created_at}</time></p>
                </div>
              </li>

            ))}
          </ul>





          <canvas
            ref={canvasRef}
            className={`border border-black dark:bg-slate-500 h-3/4 w-full rounded 2xl:h-2/5`}
            id="tracado"
          />



        </div>
      </div>
    </main>


  );

};

export default MqttPage;
