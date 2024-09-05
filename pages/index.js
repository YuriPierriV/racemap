import mqtt from 'mqtt';
import React, { useEffect, useState } from 'react';

const MqttPage = ({ mqttConfig }) => {
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    const { host, port, protocol, topic, qos, clientId, username, password } = mqttConfig;
    const connectUrl = `${protocol}://${host}:${port}/mqtt`;

    const options = {
      clientId,
      clean: true,
      username,
      password,
    };

    const client = mqtt.connect(connectUrl, options);

    client.on('connect', () => {
      console.log(`${protocol}: Connected`);

      client.subscribe(topic, { qos }, (err) => {
        if (err) {
          console.error('Failed to subscribe:', err);
        } else {
          console.log(`Subscribed to topic: ${topic}`);
        }
      });
    });

    client.on('message', (topic, payload) => {
      console.log('Received Message:', topic, payload.toString());
      setMessages((prevMessages) => [...prevMessages, payload.toString()]);
    });

    client.on('error', (err) => {
      console.error('Connection error:', err);
    });

    client.on('close', () => {
      console.log('Connection closed');
    });

    return () => {
      client.end(); // Fechar a conexão ao desmontar o componente
    };
  }, [mqttConfig]);

  return (
    <div>
      <h2>Received Messages:</h2>
      <ul>
        {messages.map((message, index) => (
          <li key={index}>{message}</li>
        ))}
      </ul>
    </div>
  );
};

// Função getServerSideProps para fornecer as variáveis ao front-end
export const getServerSideProps = async () => {
  const mqttConfig = {
    host: process.env.NEXT_PUBLIC_HIVEMQ_HOST,
    port: process.env.NEXT_PUBLIC_HIVEMQ_PORT,
    protocol: 'wss',
    topic: 'kart',
    qos: 2,
    clientId: `mqtt_${Math.random().toString(16).slice(3)}`,
    username: process.env.NEXT_PUBLIC_HIVEMQ_USERNAME,
    password: process.env.NEXT_PUBLIC_HIVEMQ_PASSWORD,
  };

  return {
    props: {
      mqttConfig,
    },
  };
};

export default MqttPage;
