const mqtt = require("mqtt");

const topic = 'kart';
const qos = 2;
const protocol = 'mqtts';
const host = process.env.HIVEMQ_HOST;
const port = process.env.HIVEMQ_PORT;
const clientId = `mqtt_${Math.random().toString(16).slice(3)}`;
const connectUrl = `${protocol}://${host}:${port}`;

let client; // Declarar o cliente em um escopo mais amplo

function clientSubscribe() {//roda ate parar
  client = mqtt.connect(connectUrl, {
    clientId,
    clean: true,
    username: process.env.HIVEMQ_USERNAME,
    password: process.env.HIVEMQ_PASSWORD,
  });

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
    // Não faz sentido retornar algo aqui, pois o retorno não será utilizado diretamente.
    // Em vez disso, manipular a mensagem no contexto React.
  });

  client.on('error', (err) => {
    console.error('Connection error:', err);
  });

  client.on('close', () => {
    console.log('Connection closed');
  });

  return client; // Retorna o cliente para uso no React
}

// Função para fechar o cliente MQTT
function closeClient() {
  if (client) {
    client.end(() => {
      console.log('Client disconnected');
    });
  } else {
    console.log('Client is not connected');
  }
}

module.exports = {
  clientSubscribe,
  closeClient,
};
