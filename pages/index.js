import mqtt from 'mqtt';
import React, { useEffect, useState } from 'react';
import { connectUrl, options } from 'infra/mqttConfig.js'; // Ajuste o caminho conforme necessário

const MqttPage = () => {
  const [messages, setMessages] = useState([]);
  const [connection, setConnection] = useState(false); // Estado para a conexão
  const [mode, setMode] = useState("0"); // Estado para o modo atual
  const [client, setClient] = useState(null); // Estado para o cliente MQTT

  useEffect(() => {
    const mqttClient = mqtt.connect(connectUrl, options);
    setClient(mqttClient); // Armazena o cliente MQTT

    mqttClient.on('connect', () => {
      setConnection(true); // Marca como conectado
      mqttClient.subscribe("kart", { qos: 2 }, (err) => {
        if (err) {
          console.error('Failed to subscribe:', err);
        }
      });
    });

    mqttClient.on('message', (topic, payload) => {
      const message = payload.toString();
      setMessages((prevMessages) => {
        const updatedMessages = [message, ...prevMessages];
        return updatedMessages.slice(0, 10); // Mantém as últimas 10 mensagens
      });
    });

    mqttClient.on('error', (err) => {
      console.error('Connection error:', err);
      setConnection(false); // Marca como desconectado em caso de erro
    });

    mqttClient.on('close', () => {
      console.log('Connection closed');
      setConnection(false); // Marca como desconectado ao fechar a conexão
    });

    // Cleanup: Fechar a conexão ao desmontar o componente
    return () => {
      mqttClient.end();
    };
  }, []);

  const sendMessage = (newMode) => {
    if (client) {
      setMode(newMode); // Atualiza o estado do modo
      client.publish('config', newMode, { qos: 2 }, (err) => {
        if (err) {
          console.error('Failed to publish:', err);
        } else {
          console.log(`Mode ${newMode} sent to config topic.`);
        }
      });
    }
  };

  return (
    <div>
      <h2>Received Messages:</h2>
      <ul>
        {messages.map((message, index) => (
          <li key={index}>{message}</li>
        ))}
      </ul>
      <h3>Connection: {connection ? 'Connected' : 'Disconnected'}</h3>

      {/* Botões para selecionar o modo */}
      <div>
        <h3>Select Mode:</h3>
        <button onClick={() => sendMessage('0')} disabled={!connection}>
          Off Mode (Send 0)
        </button>
        <button onClick={() => sendMessage('1')} disabled={!connection}>
          Normal Mode (Send 1)
        </button>
        <button onClick={() => sendMessage('10')} disabled={!connection}>
          Race Mode (Send 10)
        </button>
      </div>
      <h3>Current Mode: {mode}</h3>
    </div>
  );
};

export default MqttPage;
