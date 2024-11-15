// useMqttSubscribe.js
import { useEffect } from "react";
import { useMqtt } from "./MqttContext";

const useMqttSubscribe = (topics) => {
  const { client, isConnected } = useMqtt();

  useEffect(() => {
    if (client && isConnected && topics.length > 0) {
      const subscriptions = topics.map((topic) => {
        client.subscribe(topic, (err) => {
          if (err) {
            console.error(`Erro ao se inscrever no tópico ${topic}:`, err);
          } else {
            console.log(`Inscrito com sucesso no tópico ${topic}`);
          }
        });
        return topic;
      });

      return () => {
        subscriptions.forEach((topic) => client.unsubscribe(topic));
      };
    }
  }, [client, isConnected, topics]);
};

export default useMqttSubscribe;
