import { useState, useEffect, useRef } from "react";
import useMqttSubscribe from "pages/mqtt/useMqttSubscribe";
import useMqttPublish from "pages/mqtt/useMqttPublish";
import useMqttMessages from "pages/mqtt/useMqttMessages";

export const useGpsStatus = (gpsChip, onStatusChange) => {
  const { publishMessage, isConnected } = useMqttPublish();
  const [gpsStatus, setGpsStatus] = useState("Aguardando...");
  const [lastCheckTime, setLastCheckTime] = useState(null);
  const [mode, setMode] = useState(null);
  const timeoutRef = useRef(null);
  const intervalRef = useRef(null);

  // Subscrição MQTT
  useMqttSubscribe([`webserver/${gpsChip}/sts`]);

  // Gerenciar mensagens recebidas
  useMqttMessages((topic, message) => {
    if (topic === `webserver/${gpsChip}/sts`) {
      const status = message.status || "Status desconhecido";
      const receivedMode = message.mode;

      setGpsStatus(status);
      setMode(receivedMode);
      setLastCheckTime(new Date());

      if (onStatusChange) {
        onStatusChange(status, receivedMode);
      }

      clearTimeout(timeoutRef.current); // Limpa timeout ao receber resposta
    }
  });

  // Enviar comando para verificar status do GPS
  const checkGpsStatus = () => {
    if (isConnected) {
      publishMessage(
        `kart/${gpsChip}/sts`,
        JSON.stringify({ command: "status" }),
      );
      setLastCheckTime(new Date());

      // Define timeout para marcar como desconectado se não houver resposta
      timeoutRef.current = setTimeout(() => {
        setGpsStatus("Desconectado");
      }, 10000);
    }
  };

  // Verificação automática de status
  useEffect(() => {
    if (isConnected) {
      checkGpsStatus();
    } else {
      setGpsStatus("Desconectado");
    }

    // Configurar reconexão automática
    intervalRef.current = setInterval(() => {
      checkGpsStatus();
    }, 15000);

    return () => {
      clearTimeout(timeoutRef.current);
      clearInterval(intervalRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isConnected]);

  // Retornar os valores para serem usados em outro componente
  return {
    gpsStatus,
    lastCheckTime,
    mode,
    isConnected,
    checkGpsStatus,
  };
};
