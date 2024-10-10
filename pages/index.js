import mqtt from 'mqtt';
import React, { useEffect, useState, useRef } from 'react';
import { connectUrl, options } from 'infra/mqttConfig.js';
import { drawTrace, drawFull } from './utils/canvasUtils';
import { useRouter } from 'next/router';
import { BASE_URL } from './utils/config';
import { haversineDistance } from './utils/distance';
import { distanceMin, pointsMin, traceDistanceMin, bufferDistanceMin } from "pages/constants/distances";


const MqttPage = () => {
  const [messages, setMessages] = useState([]); //historico das mensagens do gps
  const [buffer, setBuffer] = useState([]); //lista das ultimas "5" ultimas posições na hora de criar um traçado, buffer para media
  const [trace, setTrace] = useState([]); //lista de posições quando criar traçado


  const [outerTrace, setOuterTrace] = useState([]); //lista de posições quando criar traçado 1
  const [innerTrace, setInnerTrace] = useState([]); //lista de posições quando criar traçado 2
  const [connection, setConnection] = useState(false); //vizualização da conexão com o mqtt
  const [client, setClient] = useState(null); // conexão em si do mqtt

  const [mode, setMode] = useState(0); //modo do gps


  const latMin = useRef(Infinity);
  const latMax = useRef(-Infinity);
  const longMin = useRef(Infinity);
  const longMax = useRef(-Infinity);
  const [scale, setScale] = useState({ scaleX: 1, scaleY: 1 }); //escala do mapa



  const [status, setStatus] = useState("aguardando"); //status da criação: aguardando,iniciado,externo,interno,finalização
  const [minPoints, setMinPoints] = useState(0);
  const [distance, setDistance] = useState(102);
  const [isConfirmed, setIsConfirmed] = useState(false);

  const [padding, setPadding] = useState(50); // 3
  const [curveIntensity, setCurveIntensity] = useState(0.2); // 4
  const [rotation, setRotation] = useState(0);



  const [trackName, setTrackName] = useState(""); // 5

  const [ctxOuter, setCtxOuter] = useState(null);
  const [ctxFull, setCtxFull] = useState(null);


  const canvasRef = useRef(null);
  const router = useRouter();
  //fica conectado 
  useEffect(() => {
    const mqttClient = mqtt.connect(connectUrl, options);
    setClient(mqttClient);

    mqttClient.on('connect', () => {

      mqttClient.subscribe("kart", { qos: 2 }, (err) => {
        setConnection(true);
        sendMode(0);
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
      return () => {
        console.log("passou")
        mqttClient.end();
        cancelTrace();
      };
    });

    return () => {

      mqttClient.end();
      cancelTrace();
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
    return

  }, [client]);

  useEffect(() => {
    if (status === "ajustes") {
      drawFull(canvasRef, innerTrace, outerTrace, padding, curveIntensity, rotation)
    }

  }, [padding, curveIntensity, rotation, status]);

  // Cria as listas de buffer e trace
  useEffect(() => {
    if (mode === 10) {
      if (status === "ajustes") {
        drawFull(canvasRef, innerTrace, outerTrace, padding, curveIntensity, rotation)
        sendMode(0);
        return
      }
      const position = { lat: messages[0].lat, long: messages[0].long };

      setBuffer(prevBuffer => {
        let updatedTraces; // Variável que vai armazenar as novas posições atualizadas

        // Verifica se a lista de traçados anteriores (prevBuffer) tem menos que 5 posições
        if (prevBuffer.length < 5) {
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
            if (distanceFive > bufferDistanceMin) {

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
              if (distance > traceDistanceMin) {


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

    if (trace.length <= 3) return;

    const tracado = trace.slice(0, trace.length - 3);
    setMinPoints(tracado.length)
    if (tracado.length >= pointsMin) {
      const length = tracado.length - 1;
      const distance = haversineDistance(tracado[0].lat, tracado[0].long, tracado[length].lat, tracado[length].long);
      setDistance(distance)
      if (distance < distanceMin) {
        if (status === "interno") {
          drawTrace(canvasRef, status, true, outerTrace, tracado, ctxOuter, padding);
          sendMode(0);
          setStatus("ajustes");
          setInnerTrace(tracado);
          setTrace([]);
          setBuffer([]);
          return
        }
        if (status === "externo") {
          setStatus("pre-interno");
          sendMode("0");
          setOuterTrace(tracado);
          setTrace([]);
          setBuffer([]);
          drawTrace(canvasRef, status, true, tracado, innerTrace, ctxOuter, padding);
          const canvas = canvasRef.current;
          const ctx = canvas.getContext('2d');
          setCtxOuter(ctx.getImageData(0, 0, canvas.width, canvas.height));
          return
        }
      }
    }


    if (status === "interno") {
      const ctx = drawTrace(canvasRef, status, false, outerTrace, tracado, ctxOuter, padding);
      if (ctx === 'get ctx') {
        drawTrace(canvasRef, status, true, tracado, innerTrace, ctxOuter, padding);
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        setCtxOuter(ctx.getImageData(0, 0, canvas.width, canvas.height));
      }
    }
    if (status === "externo") {

      drawTrace(canvasRef, status, false, tracado, innerTrace, ctxOuter, padding);
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





  const sendMode = (newMode) => {
    if (client) {
      setMode(prevMode => {
        return newMode
      });
      client.publish('config', String(newMode), { qos: 2 }, (err) => {
        if (err) {
          console.error('Failed to publish:', err);
        }
      });
    }
  };

  const startTrace = () => {
    setStatus("iniciando");
    sendMode(10);
  };

  const avgPlace = (lista) => {
    // Calcula a média das latitudes e longitudes das 5 últimas posições
    const totalLat = lista.reduce((acc, trace) => acc + trace.lat, 0); // Soma todas as latitudes
    const totalLng = lista.reduce((acc, trace) => acc + trace.long, 0); // Soma todas as longitudes

    const avgLat = totalLat / lista.length; // Calcula a média da latitude
    const avgLng = totalLng / lista.length; // Calcula a média da longitude

    const avgPosition = { lat: avgLat, long: avgLng }; // Cria uma nova posição média usando as médias de latitude e longitude
    return avgPosition
  }


  const cleanMetrics = () => {
    setDistance(102)
    setIsConfirmed(false)
    setMinPoints(0)

  }

  const creatOuter = () => {
    cleanMetrics()
    setStatus("externo");
    sendMode(10);
  };

  const creatInner = () => {
    cleanMetrics()
    setStatus("interno");
    sendMode(10);
  }


  const saveTrace = () => {
    if (client) {
      sendMode(0);

      // Certifique-se de que 'trace' inclua os valores de 'padding' e 'curveintensity'
      const traceData = {
        name: trackName, // ou algum outro valor relevante para 'name'
        inner_trace: innerTrace,
        outer_trace: outerTrace,
        padding: padding, // novo campo de padding
        curveintensity: curveIntensity, // novo campo de curveintensity
        rotation: rotation
      };

      fetch(`${BASE_URL}/api/v1/savetrace`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(traceData),
      })
        .then((response) => {
          if (!response.ok) {
            throw new Error("Failed to save trace");
          }

          return response.json();
        })
        .then((data) => {
          console.log("Trace saved successfully:", data);
          goToLista()
        })
        .catch((error) => {
          console.error("Error saving trace:", error);
        });
    }
  };



  const cancelTrace = () => {
    setTrace(prevTrace => {
      return [];
    });
    setBuffer(prevBuffer => {
      return [];
    });
    setTrackName("");
    setInnerTrace([]);
    setOuterTrace([]);
    setPadding(50);
    setCurveIntensity(0.2);
    cleanMetrics()
    sendMode(0);
    latMin.current = Infinity;
    latMax.current = -Infinity;
    longMin.current = Infinity;
    longMax.current = -Infinity;
    drawTrace(canvasRef, "externo", false, []);
    setStatus("aguardando");

  }

  const goToLista = async () => {
    // Se o cliente MQTT estiver conectado, desconecte antes de navegar

    // Agora pode fazer o push para /lista
    router.push('/lista');
  };



  return (
    <main className="bg-slate-700">
      <div className="grid 2xl:grid-cols-2 gap-5 p-4 bg-slate-700 min-h-screen container mx-auto">
        <div>
          {connection ? (
            <span className="inline-flex items-center bg-green-100 text-green-800 text-xs font-medium px-2.5 py-1 rounded-full dark:bg-green-900 dark:text-green-300 my-3">
              <span className="w-2 h-2 me-1 bg-green-500 rounded-full"></span>
              Conectado
            </span>
          ) : (
            <span className="inline-flex items-center bg-red-100 text-red-800 text-xs font-medium px-2.5 py-1 rounded-full dark:bg-red-900 dark:text-red-300 my-3">
              <span className="w-2 h-2 me-1 bg-red-500 rounded-full"></span>
              Desconectado
            </span>
          )}


          {status !== 'aguardando' ? (
            <div>
              <div className="mt-5  grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6">
                <div className="sm:col-span-2">
                  <h2 className="text-base font-semibold leading-7 text-white">Inicie um traçado</h2>
                  <p className="mt-1 text-sm leading-6 text-slate-400">Tenha um GPS conectado</p>
                </div>
                <div className="sm:col-span-4">

                  <ol className="flex justify-center items-center w-full p-3 space-x-2 text-sm font-medium text-center text-gray-500 bg-white border border-gray-200 rounded-lg shadow-sm dark:text-gray-400 sm:text-base dark:bg-gray-800 dark:border-gray-700 sm:p-4 sm:space-x-4 rtl:space-x-reverse">
                    <li className={`flex items-center ${status === "externo" || status === "interno" || status === "ajustes" || status === "pre-interno" ? "text-blue-600 dark:text-blue-500" : ""} `}>
                      <span className={`flex items-center justify-center w-5 h-5 me-2 text-xs border ${status === "externo" ? "border-blue-600 rounded-full shrink-0 dark:border-blue-500" : "border-gray-500 rounded-full shrink-0 dark:border-gray-400"} `}>
                        1
                      </span>
                      Externo
                      <svg className="w-3 h-3 ms-2 sm:ms-4 rtl:rotate-180" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 12 10">
                        <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m7 9 4-4-4-4M1 9l4-4-4-4" />
                      </svg>
                    </li>
                    <li className={`flex items-center ${status === "interno" || status === "ajustes" ? "text-blue-600 dark:text-blue-500" : ""} `}>
                      <span className={`flex items-center justify-center w-5 h-5 me-2 text-xs border ${status === "interno" ? "border-blue-600 rounded-full shrink-0 dark:border-blue-500" : "border-gray-500 rounded-full shrink-0 dark:border-gray-400"} `}>
                        2
                      </span>
                      Interno
                      <svg className="w-3 h-3 ms-2 sm:ms-4 rtl:rotate-180" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 12 10">
                        <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m7 9 4-4-4-4M1 9l4-4-4-4" />
                      </svg>
                    </li>
                    <li className={`flex items-center ${status === "ajustes" ? "text-blue-600 dark:text-blue-500" : ""} `}>
                      <span className={`flex items-center justify-center w-5 h-5 me-2 text-xs border ${status === "ajustes" ? "border-blue-600 rounded-full shrink-0 dark:border-blue-500" : "border-gray-500 rounded-full shrink-0 dark:border-gray-400"} `}>
                        3
                      </span>
                      Ajustes
                    </li>
                  </ol>


                </div>

              </div>
              {status === "iniciando" && (
                <div>
                  <div>
                    <form onSubmit={creatOuter}>
                      <div className="space-y-12">
                        <div className="border-b border-gray-900/10 pb-12">

                          <div className="mt-5 grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6 dark:bg-gray-800 dark:border-gray-700 sm:p-4 sm:space-x-4 rtl:space-x-reverse p-3 space-x-2 text-sm font-medium text-gray-500 bg-white border border-gray-200 rounded-lg shadow-sm">

                            <div className="sm:col-span-full">
                              <label className="block text-sm font-medium leading-6 text-white">
                                Nome do traçado
                              </label>
                              <div className="mt-2">
                                <input
                                  type="text"
                                  value={trackName}
                                  onChange={(e) => setTrackName(e.target.value)}
                                  placeholder="Nome do traçado"
                                  className="block w-full rounded-md border-0 py-1.5 px-4 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-0 focus:ring-inset focus:ring-blue-800 sm:text-sm sm:leading-6"
                                />
                              </div>
                            </div>

                            <div className="sm:col-span-full mt-4">
                              <label className="flex items-center">
                                <input
                                  type="checkbox"
                                  checked={isConfirmed}
                                  onChange={(e) => setIsConfirmed(e.target.checked)}
                                  className="mr-2 rounded border-gray-300 text-blue-600 shadow-sm focus:ring-blue-600"
                                />
                                Confirme estar na posição inicial da parte externa do traçado.
                              </label>
                            </div>

                            <div className="mt-3 sm:col-span-full mx-10 flex items-center justify-end gap-x-6">
                              <button
                                type="button"
                                className="text-sm font-semibold leading-6 text-gray-400"
                                onClick={cancelTrace}
                              >
                                Cancelar
                              </button>
                              <button
                                type="submit"
                                className={`rounded-md px-3 py-2 text-sm font-semibold text-white shadow-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 ${isConfirmed ? 'bg-blue-600 hover:bg-blue-800 focus-visible:outline-blue-600' : 'bg-gray-400 cursor-not-allowed'
                                  }`}
                                disabled={!isConfirmed}
                              >
                                Iniciar
                              </button>
                            </div>

                          </div>

                        </div>
                      </div>
                    </form>
                  </div>
                </div>
              )}
              {status === "externo" && (
                <div>
                  <div>
                    <div className="space-y-12">
                      <div className="border-b border-gray-900/10 pb-12">
                        <div className="mt-5  grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6 dark:bg-gray-800 dark:border-gray-700 sm:p-4 sm:space-x-4 rtl:space-x-reverse p-3 space-x-2 text-sm font-medium text-gray-500 bg-white border border-gray-200 rounded-lg shadow-sm">
                          <div className="mt-3 sm:col-span-full">
                            {minPoints >= 10 ? (
                              <span className="inline-flex items-center bg-green-100 text-green-800 text-xs font-medium px-2.5 py-1 rounded-full dark:bg-green-900 dark:text-green-300 my-3">
                                <span className="w-2 h-2 me-1 bg-green-500 rounded-full"></span>
                                Adicione 10 pontos ao traçado: {minPoints} pontos
                              </span>
                            ) : (
                              <span className="inline-flex items-center bg-red-100 text-red-800 text-xs font-medium px-2.5 py-1 rounded-full dark:bg-red-900 dark:text-red-300 my-3">
                                <span className="w-2 h-2 me-1 bg-red-500 rounded-full"></span>
                                Adicione 10 pontos ao traçado: {minPoints} pontos
                              </span>
                            )}
                            <div className="">
                              <div className="flex justify-between mb-1">
                                <span className="text-base font-medium text-blue-700 dark:text-white">Para concluir fique menos de 2 metros do ponto inicial</span>
                                <span className="text-sm font-medium text-blue-700 dark:text-white">{minPoints && minPoints >= 10 ? distance.toFixed(2) : ""} metros</span>
                              </div>
                              <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-400">
                                <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: `${102 - distance}%` }}></div>
                              </div>
                            </div>


                          </div>
                          <div className="mt-3 sm:col-span-full mx-10 flex items-center justify-end gap-x-6">
                            <button type="button" className="text-sm font-semibold leading-6 text-gray-400" onClick={() => cancelTrace()}>
                              Cancelar
                            </button>
                            <button
                              disabled={true}
                              className="rounded-md bg-gray-400 cursor-not-allowed px-3 py-2 text-sm font-semibold text-white shadow-sm "
                            >
                              Iniciar Traçado interno
                            </button>
                          </div>

                        </div>

                      </div>
                    </div>
                  </div>
                </div>
              )}
              {status === "pre-interno" && (
                <div>
                  <div>
                    <form onSubmit={creatInner}>
                      <div className="space-y-12">
                        <div className="border-b border-gray-900/10 pb-12">

                          <div className="mt-5 grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6 dark:bg-gray-800 dark:border-gray-700 sm:p-4 sm:space-x-4 rtl:space-x-reverse p-3 space-x-2 text-sm font-medium text-gray-500 bg-white border border-gray-200 rounded-lg shadow-sm">

                            <div className="sm:col-span-full mt-4">
                              <label className="flex items-center">
                                <input
                                  type="checkbox"
                                  checked={isConfirmed}
                                  onChange={(e) => setIsConfirmed(e.target.checked)}
                                  className="mr-2 rounded border-gray-300 text-blue-600 shadow-sm focus:ring-blue-600"
                                />
                                Confirme estar na posição inicial da parte externa do traçado.
                              </label>
                            </div>

                            <div className="mt-3 sm:col-span-full mx-10 flex items-center justify-end gap-x-6">
                              <button
                                type="button"
                                className="text-sm font-semibold leading-6 text-gray-400"
                                onClick={cancelTrace}
                              >
                                Cancelar
                              </button>
                              <button
                                type="submit"
                                className={`rounded-md px-3 py-2 text-sm font-semibold text-white shadow-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 ${isConfirmed ? 'bg-blue-600 hover:bg-blue-800 focus-visible:outline-blue-600' : 'bg-gray-400 cursor-not-allowed'
                                  }`}
                                disabled={!isConfirmed}
                              >
                                Iniciar Traçado Interno
                              </button>
                            </div>

                          </div>

                        </div>
                      </div>
                    </form>
                  </div>
                </div>
              )}
              {status === "interno" && (
                <div>
                  <div>
                    <div className="space-y-12">
                      <div className="border-b border-gray-900/10 pb-12">
                        <div className="mt-5  grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6 dark:bg-gray-800 dark:border-gray-700 sm:p-4 sm:space-x-4 rtl:space-x-reverse p-3 space-x-2 text-sm font-medium text-gray-500 bg-white border border-gray-200 rounded-lg shadow-sm">
                          <div className="mt-3 sm:col-span-full">
                            {minPoints >= 10 ? (
                              <span className="inline-flex items-center bg-green-100 text-green-800 text-xs font-medium px-2.5 py-1 rounded-full dark:bg-green-900 dark:text-green-300 my-3">
                                <span className="w-2 h-2 me-1 bg-green-500 rounded-full"></span>
                                Adicione 10 pontos ao traçado: {minPoints} pontos
                              </span>
                            ) : (
                              <span className="inline-flex items-center bg-red-100 text-red-800 text-xs font-medium px-2.5 py-1 rounded-full dark:bg-red-900 dark:text-red-300 my-3">
                                <span className="w-2 h-2 me-1 bg-red-500 rounded-full"></span>
                                Adicione 10 pontos ao traçado: {minPoints} pontos
                              </span>
                            )}
                            <div className="">
                              <div className="flex justify-between mb-1">
                                <span className="text-base font-medium text-blue-700 dark:text-white">Para concluir fique menos de 2 metros do ponto inicial</span>
                                <span className="text-sm font-medium text-blue-700 dark:text-white">{minPoints && minPoints >= 10 ? distance.toFixed(2) : ""} metros</span>
                              </div>
                              <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-400">
                                <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: `${102 - distance}%` }}></div>
                              </div>
                            </div>


                          </div>
                          <div className="mt-3 sm:col-span-full mx-10 flex items-center justify-end gap-x-6">
                            <button type="button" className="text-sm font-semibold leading-6 text-gray-400" onClick={() => cancelTrace()}>
                              Cancelar
                            </button>
                            <button
                              disabled={true}
                              className="rounded-md bg-gray-400 cursor-not-allowed px-3 py-2 text-sm font-semibold text-white shadow-sm "
                            >
                              Ajustar
                            </button>
                          </div>

                        </div>

                      </div>
                    </div>
                  </div>
                </div>
              )}
              {status === "ajustes" && (
                <div>
                  <div className='mt-5  grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6 dark:bg-gray-800 dark:border-gray-700 sm:p-4 sm:space-x-4 rtl:space-x-reverse p-3 space-x-2 text-sm font-medium text-gray-500 bg-white border border-gray-200 rounded-lg shadow-sm'>
                    <div className="mt-3 sm:col-span-full">
                      <div className="flex flex-col space-y-4">
                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          Ajustar Padding
                        </label>
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

                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          Ajustar Intensidade da Curva
                        </label>
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
                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          Ajustar Rotação
                        </label>
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
                    </div>
                    <div className="mt-3 sm:col-span-full mx-10 flex items-center justify-end gap-x-6">
                      <button type="button" className="text-sm font-semibold leading-6 text-gray-400" onClick={() => cancelTrace()}>
                        Cancelar
                      </button>
                      <button
                        onClick={saveTrace}
                        disabled={!connection || mode === 10 || mode === 10}
                        className="px-6 py-2 bg-blue-500 text-white rounded-lg mr-3 font-bold transition-all duration-300 transform hover:scale-105 hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
                      >
                        Salvar Traçado
                      </button>
                    </div>
                  </div>
                </div>
              )}
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

          {status === 'aguardando' && (
            <>
              <div className="mb-4 mt-4">
                <h3 className="text-xl font-semibold mb-2">Modo:</h3>
                <button
                  onClick={() => sendMode(0)}
                  disabled={!connection || mode === 10 || mode === 0}
                  className={`px-6 py-2 rounded-lg mr-3 font-bold transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg bg-red-500 text-white hover:bg-red-600'
                    }`}
                >
                  Off
                </button>
                <button
                  onClick={() => sendMode(1)}
                  disabled={!connection || mode === 10 || mode === 1}
                  className="px-6 py-2 bg-green-500 text-white rounded-lg mr-3 font-bold transition-all duration-300 transform hover:scale-105 hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
                >
                  On
                </button>
                <button
                  onClick={startTrace}
                  disabled={!connection || mode === 10 || mode === 10}
                  className="px-6 py-2 bg-blue-500 text-white rounded-lg mr-3 font-bold transition-all duration-300 transform hover:scale-105 hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
                >
                  Criar Traçado
                </button>
                <button
                  onClick={goToLista}
                  className="px-6 py-2 bg-yellow-500 text-white rounded-lg mr-3 font-bold transition-all duration-300 transform hover:scale-105 hover:bg-yellow-600 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
                >
                  Traçados salvos
                </button>


              </div>
            </>
          )}






          <canvas
            ref={canvasRef}
            className={`border border-black dark:bg-gray-900 h-3/4 w-full rounded 2xl:h-2/5`}
            id="tracado"
          />



        </div>
      </div>
    </main>

  );

};

export default MqttPage;
