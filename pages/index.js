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

        setLatMin(prevMin => (prevMin === Infinity ? position.lat : Math.min(prevMin, position.lat)));
        setLatMax(prevMax => (prevMax === -Infinity ? position.lat : Math.max(prevMax, position.lat)));
        setLongMin(prevMin => (prevMin === Infinity ? position.long : Math.min(prevMin, position.long)));
        setLongMax(prevMax => (prevMax === -Infinity ? position.long : Math.max(prevMax, position.long)));

        setTrace(prevTrace => {
          if (prevTrace.length > 0) {
            const lastPosition = prevTrace[0];
            const distance = haversineDistance(lastPosition.lat, lastPosition.long, position.lat, position.long);
            // Adiciona a nova posição apenas se a distância for maior que 2 metros
            if (distance > 2) {
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
    if (trace.length > 0) {
      const newScaleX = canvasRef.current.width / (longMax - longMin);
      const newScaleY = canvasRef.current.height / (latMax - latMin);
      setScale({ scaleX: newScaleX, scaleY: newScaleY });
      drawTrace(trace);
    }
  }, [trace, longMin, longMax, latMin, latMax]);

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
      const y = canvas.height - (pos.lat - latMin) * scale.scaleY; // Inverte Y para o canvas
      if (index === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    });
    ctx.strokeStyle = 'blue';
    ctx.lineWidth = 2;
    ctx.stroke();
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

      // Enviar o traçado para o servidor
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
          Normal Mode
        </button>
        <button onClick={() => sendMessage('10')} disabled={!connection || mode === 'Criando traçado'}>
          Race Mode
        </button>
      </div>
      <h3>Current Mode: {mode}</h3>
      <div>
        <h3>Criar traçado:</h3>
        <button onClick={createTrace} disabled={!connection || mode === 'Criando traçado'}>
          Iniciar
        </button>
        <button onClick={saveTrace} disabled={!connection}>
          Finalizar
        </button>
      </div>
      <h2>Traçado:</h2>

      <canvas ref={canvasRef} width={800} height={600} style={{ border: '1px solid black' }} />
    </div>
  );
};

export default MqttPage;
