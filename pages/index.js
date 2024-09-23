import mqtt from 'mqtt';
import React, { useEffect, useState, useRef } from 'react';
import { connectUrl, options } from 'infra/mqttConfig.js';

const MqttPage = () => {
  const [messages, setMessages] = useState([]);
  const [connection, setConnection] = useState(false);
  const [mode, setMode] = useState("0");
  const [client, setClient] = useState(null);
  const [trace, setTrace] = useState([]);
  const [latMin, setLatMin] = useState(Infinity);
  const [latMax, setLatMax] = useState(-Infinity);
  const [longMin, setLongMin] = useState(Infinity);
  const [longMax, setLongMax] = useState(-Infinity);
  const canvasRef = useRef(null);
  const [scale, setScale] = useState({ scaleX: 1, scaleY: 1 });
  const BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:3000";
  const [savedTraces, setSavedTraces] = useState([]);
  const [selectedTrace, setSelectedTrace] = useState(null); // Traçado selecionado
  const [fiveTraces, setFiveTraces] = useState([]);

  useEffect(() => {
    const mqttClient = mqtt.connect(connectUrl, options);
    setClient(mqttClient);

    mqttClient.on('connect', () => {
      setConnection(true);
      mqttClient.subscribe("kart", { qos: 2 }, (err) => {
        if (err) {
          console.error('Failed to subscribe:', err);
        }
      });
    });

    mqttClient.on('message', (topic, payload) => {
      const message = JSON.parse(payload.toString());
      if (mode === "Criando traçado") {
        const position = { lat: message.lat, long: message.long };

        setFiveTraces(prevFive => {
          let updatedTraces; // Variável que vai armazenar as novas posições atualizadas

          // Verifica se a lista de traçados anteriores (prevFive) tem menos que 5 posições
          if (prevFive.length < 10) {
            // Se a lista estiver vazia, simplesmente retorna a nova posição como a primeira posição da lista
            if (prevFive.length == 0) {
              return [position];
            }

            // Se a lista de traçados anteriores tiver algum item

            if (trace.length > 0) {
              console.log(trace[0]);
              const lastPositionTrace = trace[0]; // Pega a última posição registrada em 'trace'


              // Calcula a distância entre a última posição de 'trace' e a nova posição 'position'
              const distanceFive = haversineDistance(lastPositionTrace.lat, lastPositionTrace.long, position.lat, position.long);

              // Se a distância for menor que 4 metros, a nova posição será adicionada
              if (distanceFive < 4 && distanceFive > 1) {
                console.log("passou   " + distanceFive)
                updatedTraces = [position, ...prevFive]; // Adiciona a nova posição no início da lista de traçados anteriores
                return updatedTraces; // Retorna a lista atualizada
              }

              // Se a distância for maior que 4 metros, retorna a lista anterior sem alterações
              console.log("não passou " + prevFive.length);
              return prevFive;
            } else {
              // Caso a lista nao tenha posições, adiciona a nova posição diretamente
              updatedTraces = [position, ...prevFive];

              return updatedTraces; // Retorna a lista atualizada
            }
          } else {
            // Caso a lista de traçados anteriores já tenha 5 posições, adiciona a nova posição e remove a mais antiga
            updatedTraces = [position, ...prevFive]; // Mantém apenas as 5 posições mais recentes

            // Calcula a média das latitudes e longitudes das 5 últimas posições
            const totalLat = updatedTraces.reduce((acc, trace) => acc + trace.lat, 0); // Soma todas as latitudes
            const totalLng = updatedTraces.reduce((acc, trace) => acc + trace.long, 0); // Soma todas as longitudes

            const avgLat = totalLat / updatedTraces.length; // Calcula a média da latitude
            const avgLng = totalLng / updatedTraces.length; // Calcula a média da longitude

            const avgPosition = { lat: avgLat, long: avgLng }; // Cria uma nova posição média usando as médias de latitude e longitude



            // Atualiza a lista 'trace' com base na distância entre a última posição e a média calculada
            setTrace(prevTrace => {

              if (prevTrace.length > 0) {
                const lastPosition = prevTrace[0]; // Pega a última posição registrada em 'trace'

                // Calcula a distância entre a última posição e a média das 5 últimas posições
                const distance = haversineDistance(lastPosition.lat, lastPosition.long, avgPosition.lat, avgPosition.long);

                // Se a distância for maior que 2 metros e menor que 4 metros, adiciona a média à lista de traçados
                if (distance > 1 && distance < 2) {
                  console.log(distance); // Exibe a distância no console

                  // Atualiza os valores mínimos e máximos de latitude
                  setLatMin(prevMin => Math.min(prevMin, avgPosition.lat));
                  setLatMax(prevMax => Math.max(prevMax, avgPosition.lat));

                  // Atualiza os valores mínimos e máximos de longitude
                  setLongMin(prevMin => Math.min(prevMin, avgPosition.long));
                  setLongMax(prevMax => Math.max(prevMax, avgPosition.long));

                  return [avgPosition, ...prevTrace]; // Adiciona a média ao início da lista de 'trace'
                }
                console.log(distance + " naoo passou");
                return prevTrace;
              } else {
                // Se 'trace' estiver vazio, adiciona a nova posição média como o primeiro item
                return [avgPosition];
              }
            });


            return [];
          }
        });


      } else {
        setMessages(prevMessages => {
          const updatedMessages = [message, ...prevMessages];
          return updatedMessages.slice(0, 10);
        });
      }
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
  }, [mode]);

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

      const newScaleX = canvasRef.current.width / (longMax - longMin);
      const newScaleY = canvasRef.current.height / (latMax - latMin);

      setScale({ scaleX: newScaleX, scaleY: newScaleY });
      drawTrace(trace);
    }

  }, [trace]); // Dependências que devem acionar a atualização


  const haversineDistance = (lat1, long1, lat2, long2) => {
    const R = 6371000; // Raio da Terra em metros
    const toRadians = (degrees) => degrees * (Math.PI / 180);
    const dLat = toRadians(lat2 - lat1);
    const dLong = toRadians(long2 - long1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) *
      Math.sin(dLong / 2) * Math.sin(dLong / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c; // Distância em metros
  };

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
    const adjustedScaleX = (canvas.width - 2 * padding) / (longMax - longMin);
    const adjustedScaleY = (canvas.height - 2 * padding) / (latMax - latMin);

    ctx.beginPath();
    positions.forEach((pos, index) => {
      // Ajusta as coordenadas com o padding
      const x = (pos.long - longMin) * adjustedScaleX + padding;
      const y = canvas.height - ((pos.lat - latMin) * adjustedScaleY + padding); // O canvas inverte o eixo Y, então usamos canvas.height

      if (index === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    });

    ctx.strokeStyle = 'blue';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Desenha pontos
    positions.forEach((pos) => {
      // Ajusta as coordenadas dos pontos com o padding
      const x = (pos.long - longMin) * adjustedScaleX + padding;
      const y = canvas.height - ((pos.lat - latMin) * adjustedScaleY + padding);

      ctx.beginPath();
      ctx.arc(x, y, 3, 0, Math.PI * 2);
      ctx.fillStyle = 'red';
      ctx.fill();
    });
  };



  const sendMessage = (newMode) => {
    if (client) {
      setMode(newMode);
      client.publish('config', newMode, { qos: 2 }, (err) => {
        if (err) {
          console.error('Failed to publish:', err);
        }
      });
    }
  };

  const createTrace = () => {
    if (client) {
      setMode("Criando traçado");
      client.publish('config', "10", { qos: 2 }, (err) => {
        if (err) {
          console.error('Failed to publish:', err);
        }
      });
    }
  };

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
          selectTrace(data.trackId);
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



  return (
    <div>
      <h2>Received Messages:</h2>
      <ul>
        {messages.map((message, index) => (
          <li key={index}>{JSON.stringify(message)}</li>
        ))}
      </ul>
      <h3>Connection: {connection ? 'Connected' : 'Disconnected'}</h3>

      <div>
        <h3>Select Mode:</h3>
        <button onClick={() => sendMessage('0')} disabled={!connection || mode === 'Criando traçado'}>
          Off Mode
        </button>
        <button onClick={() => sendMessage('1')} disabled={!connection || mode === 'Criando traçado'}>
          On Mode
        </button>
        <button onClick={createTrace} disabled={!connection || mode === 'Criando traçado'}>
          Create Trace
        </button>
        <button onClick={saveTrace} disabled={trace.length === 0}>
          Save Trace
        </button>
      </div>

      <h3>Traces:</h3>
      <select onChange={(e) => {
        const index = e.target.selectedIndex - 1; // Ajuste para ignorar a opção padrão
        if (index >= 0 && index < savedTraces.length) {
          selectTrace(savedTraces[index].trace);
        } else {
          setSelectedTrace(null); // Limpa a seleção se a opção padrão for escolhida
        }
      }}>
        <option value="">Select a trace</option>
        {savedTraces.map((trace, index) => (
          <option key={index} value={index}>
            {trace.id}
          </option>
        ))}
      </select>

      <br></br>
      <canvas ref={canvasRef} width={800} height={600} style={{ border: '1px solid black' }} />
    </div>
  );
};

export default MqttPage;
