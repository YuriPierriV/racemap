// useMqttPublish.js
import { stringify } from "postcss";
import { useMqtt } from "./MqttContext";

const useMqttPublish = () => {
  const { client, isConnected } = useMqtt();

  const publishMessage = (topic, message) => {
    if (client && isConnected) {
      client.publish(topic, message, (err) => {
        if (err) {
          console.error(`Erro ao publicar no tópico ${topic}:`, err);
        } else {
          console.log(`Mensagem publicada com sucesso no tópico ${topic}`);
        }
      });
    } else {
      console.warn("Não conectado ao broker MQTT");
    }
  };

  return { publishMessage, isConnected };
};

export default useMqttPublish;
