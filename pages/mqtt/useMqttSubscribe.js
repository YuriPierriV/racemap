import { useEffect, useRef } from "react";
import { useMqtt } from "./MqttContext";

const useMqttSubscribe = (topics) => {
  const { client, isConnected } = useMqtt();
  const subscribedTopicsRef = useRef(new Set());

  useEffect(() => {
    if (client && isConnected && Array.isArray(topics) && topics.length > 0) {
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

      return () => {
        topics.forEach((topic) => {
          if (subscribedTopicsRef.current.has(topic)) {
            client.unsubscribe(topic, (err) => {
              if (err) {
                console.error(
                  `Erro ao cancelar inscrição no tópico ${topic}:`,
                  err,
                );
              } else {
                console.log(`Cancelada a inscrição no tópico ${topic}`);
                subscribedTopicsRef.current.delete(topic);
              }
            });
          }
        });
      };
    }
  }, [client, isConnected, topics]);
};

export default useMqttSubscribe;
