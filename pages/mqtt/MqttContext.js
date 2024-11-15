// MqttContext.js
import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useRef,
} from "react";
import mqtt from "mqtt";
import { connectUrl, options } from "infra/mqttConfig.js";
import Custom404 from "pages/404";

const MqttContext = createContext();

export const MqttProvider = ({ clientId, children }) => {
  const [client, setClient] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const clientRef = useRef(null);

  useEffect(() => {
    // Verifica se o cliente já foi inicializado para evitar reconexões
    if (clientRef.current) return;

    const mqttOptions = { ...options, clientId };
    clientRef.current = mqtt.connect(connectUrl, mqttOptions);

    clientRef.current.on("connect", () => {
      setIsConnected(true);
      console.log("Conectado ao broker MQTT");
    });

    clientRef.current.on("error", (err) => {
      console.error("Erro de conexão:", err);
      setIsConnected(false);
    });

    clientRef.current.on("close", () => {
      console.log("Conexão MQTT encerrada");
      setIsConnected(false);
    });

    setClient(clientRef.current);

    return () => {
      if (clientRef.current) {
        clientRef.current.end();
        clientRef.current = null;
      }
    };
  }, [clientId]);

  return (
    <MqttContext.Provider value={{ client, isConnected }}>
      {children}
    </MqttContext.Provider>
  );
};

// Hook para acessar o contexto MQTT
export const useMqtt = () => useContext(MqttContext);

export default Custom404;
