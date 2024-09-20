import mqtt from 'mqtt';
import React, { useEffect, useState } from 'react';
import { connectUrl, options } from 'infra/mqttConfig.js'; // Ajuste o caminho conforme necessário

const MqttPage = () => {
  const [messages, setMessages] = useState([]);
  const [connection, setConnection] = useState(false); // Estado para a conexão

  useEffect(() => {
    const client = mqtt.connect(connectUrl, options);

    client.on('connect', () => {
      setConnection(true); // Marca como conectado
      client.subscribe("kart", { qos: 2 }, (err) => {
        if (err) {
          console.error('Failed to subscribe:', err);
        }
      });
    });

    client.on('message', (topic, payload) => {
      const newMessage = payload.toString();
      setMessages((prevMessages) => {
        const updatedMessages = [newMessage, ...prevMessages];
        return updatedMessages.slice(0, 10); // Mantém as últimas 10 mensagens
      });
    });

    client.on('error', (err) => {
      console.error('Connection error:', err);
      setConnection(false); // Marca como desconectado em caso de erro
    });

    client.on('close', () => {
      console.log('Connection closed');
      setConnection(false); // Marca como desconectado ao fechar a conexão
    });

    return () => {
      client.end(); // Fechar a conexão ao desmontar o componente
    };
  }, []);

  return (
    <div>
      <h2>Received Messages:</h2>
      <ul>
        {messages.map((message, index) => (
          <li key={index}>{message}</li>
        ))}
      </ul>
      <h3>Connection: {connection ? 'Connected' : 'Disconnected'}</h3> {/* Exibe o status da conexão */}
    </div>
  );
};

export default MqttPage;
