import { useState, useRef } from "react";
import useMqttSubscribe from "pages/mqtt/useMqttSubscribe";
import useMqttPublish from "pages/mqtt/useMqttPublish";
import useMqttMessages from "pages/mqtt/useMqttMessages";

export const useGpsStatus = (gpsChip, onStatusChange) => {
  const { publishMessage, isConnected } = useMqttPublish();

  const [gpsStatus, setGpsStatus] = useState("Aguardando...");
  const [comm, setComm] = useState("Não Iniciada");
  const [lastCheckTime, setLastCheckTime] = useState(null);
  const [mode, setMode] = useState(null);
  const timeoutRef = useRef(null);

  // Subscrição MQTT
  useMqttSubscribe([`webserver/${gpsChip}/sts`]);

  // Gerenciar mensagens recebidas
  useMqttMessages((topic, message) => {
    if (topic === `webserver/${gpsChip}/sts`) {
      const status = message.status || "Status desconhecido";
      const receivedMode = message.mode;
      const lastCheckTimeNow = new Date();
      setComm("Recebido");
      setTimeout(() => {
        setGpsStatus(status);
        setMode(receivedMode);
        setComm("Conectado");
        setLastCheckTime(lastCheckTimeNow);
      }, 2000);

      if (onStatusChange) {
        onStatusChange(status, receivedMode, lastCheckTimeNow, comm);
      }

      clearTimeout(timeoutRef.current); // Limpa timeout ao receber resposta
    }
  });

  // Enviar comando para verificar status do GPS
  const checkGpsStatus = () => {
    if (isConnected) {
      setLastCheckTime(new Date());
      setComm("Enviando");
      setTimeout(() => {
        publishMessage(
          `kart/${gpsChip}/sts`,
          JSON.stringify({ command: "status" }),
        );
        setComm("Enviado");
      }, 2000);

      if (onStatusChange) {
        onStatusChange(gpsStatus, mode, lastCheckTime, comm);
      }

      // Define timeout para marcar como desconectado se não houver resposta
      timeoutRef.current = setTimeout(() => {
        setGpsStatus("Desconectado");
        setComm("Não recebido");
      }, 10000);
    }
  };

  // Retornar os valores para serem usados em outro componente
  return {
    gpsStatus,
    comm,
    lastCheckTime,
    mode,
    isConnected,
    checkGpsStatus,
  };
};
