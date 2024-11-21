import { useEffect, useRef } from "react";
import { useMqtt } from "./MqttContext";

const useMqttSubscribe = (topics) => {
  const { client, isConnected } = useMqtt();
  const subscribedTopicsRef = useRef(new Set());

  useEffect(() => {
    if (client && isConnected && Array.isArray(topics) && topics.length > 0) {
      // Identifica tópicos novos para subscrever
      const newSubscriptions = topics.filter(
        (topic) => !subscribedTopicsRef.current.has(topic),
      );

      if (newSubscriptions.length > 0) {
        newSubscriptions.forEach((topic) => {
          client.subscribe(topic, { qos: 2, nl: true }, (err) => {
            if (err) {
              console.error(`Erro ao se inscrever no tópico ${topic}:`, err);
            } else {
              console.log(`Inscrito com sucesso no tópico ${topic}`);
              subscribedTopicsRef.current.add(topic);
            }
          });
        });
      }
    }

    // Remove o retorno para evitar desinscrever automaticamente
  }, [client, isConnected, topics]);

  // Limpeza ao desmontar o site ou desconectar o cliente MQTT
  useEffect(() => {
    return () => {
      if (client) {
        subscribedTopicsRef.current.forEach((topic) => {
          client.unsubscribe(topic, (err) => {
            if (err) {
              console.error(
                `Erro ao cancelar inscrição no tópico ${topic}:`,
                err,
              );
            } else {
              console.log(`Cancelada a inscrição no tópico ${topic}`);
            }
          });
        });
        subscribedTopicsRef.current.clear();
      }
    };
  }, [client]);
};

export default useMqttSubscribe;
