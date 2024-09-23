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

        setTrace(prevTrace => {
          if (prevTrace.length > 0) {
            const lastPosition = prevTrace[0];
            const distance = haversineDistance(lastPosition.lat, lastPosition.long, position.lat, position.long);
            // Adiciona a nova posição apenas se a distância for maior que 10 metros
            if (distance > 2) {
              setLatMin(prevMin => (prevMin === Infinity ? position.lat : Math.min(prevMin, position.lat)));
              setLatMax(prevMax => (prevMax === -Infinity ? position.lat : Math.max(prevMax, position.lat)));
              setLongMin(prevMin => (prevMin === Infinity ? position.long : Math.min(prevMin, position.long)));
              setLongMax(prevMax => (prevMax === -Infinity ? position.long : Math.max(prevMax, position.long)));
              return [position, ...prevTrace];
            }
          } else {
            return [position]; // Se não há posições, adiciona a nova
          }
          return prevTrace; // Mantém a lista anterior se a condição não for atendida
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
  }, []);

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

    ctx.beginPath();
    positions.forEach((pos, index) => {
      const x = (pos.long - longMin) * scale.scaleX;
      const y = canvas.height - (pos.lat - latMin) * scale.scaleY;
      if (index === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    });

    ctx.strokeStyle = 'blue';
    ctx.lineWidth = 2;
    ctx.stroke();

    positions.forEach((pos) => {
      const x = (pos.long - longMin) * scale.scaleX;
      const y = canvas.height - (pos.lat - latMin) * scale.scaleY;

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
      client.publish('config', "1", { qos: 2 }, (err) => {
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
