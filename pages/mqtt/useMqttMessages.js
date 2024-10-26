// useMqttMessages.js
import { useEffect } from "react";
import { useMqtt } from "./MqttContext";

const useMqttMessages = (onMessage) => {
  const { client } = useMqtt();

  useEffect(() => {
    const handleMessage = (topic, message) => {
      if (onMessage) {
        try {
          onMessage(topic, JSON.parse(message.toString()));
        } catch {
          onMessage(topic, message.toString());
        }
      }
    };

    if (client) {
      client.on("message", handleMessage);
    }

    return () => {
      if (client) {
        client.off("message", handleMessage);
      }
    };
  }, [client, onMessage]);
};

export default useMqttMessages;
