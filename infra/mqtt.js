var mqtt = require("mqtt");

var PORT = process.env.HIVEMQ_PORT;
var HOST = process.env.HIVEMQ_HOST;

var options = {
  port: PORT,
  host: HOST,
  //keyPath: KEY,
  //certPath: CERT,
  //rejectUnauthorized : true,
  //The CA list will be used to determine if server is authorized
  //ca: TRUSTED_CA_LIST
};

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
