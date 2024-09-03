var mqtt = require("mqtt");

const fs = require('fs')
const protocol = 'mqtts'
// Set the host and port based on the connection information.
const host = process.env.HIVEMQ_HOST;
const port = process.env.HIVEMQ_PORT;
const clientId = `mqtt_${Math.random().toString(16).slice(3)}`
const connectUrl = `${protocol}://${host}:${port}`

const client = mqtt.connect(connectUrl, {
  clientId,
  clean: true,
  connectTimeout: 4000,
  username: process.env.USERNAME,
  password: HIVEMQ_PASSWORD,
  reconnectPeriod: 1000,
})
/*
async function subscribeTopic(topic) {
  const client = mqtt.connect(options);

  return new Promise((resolve, reject) => {
    client.on("connect", () => {
      console.log("Conectado ao broker MQTT");

      client.subscribe(topic, (error) => {
        if (error) {
          console.error("Erro ao assinar o tópico:", error);
          client.end();
          return reject(error);
        }

        console.log("Assinado no tópico:", topic);

        // Ouve as mensagens do tópico
        client.on("message", (topic, message) => {
          console.log(
            `Mensagem recebida no tópico ${topic}: ${message.toString()}`,
          );
          client.end();
        });
        resolve(client);
      });
    });

    client.on("error", (error) => {
      console.error("Erro de conexão MQTT:", error);
      client.end();
      reject(error);
    });
  });
}

export default {
  subscribeTopic: subscribeTopic,
};
*/
