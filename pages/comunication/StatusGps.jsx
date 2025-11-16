import { useState, useRef, useEffect } from "react";
import useMqttSubscribe from "pages/mqtt/useMqttSubscribe";
import useMqttPublish from "pages/mqtt/useMqttPublish";
import useMqttMessages from "pages/mqtt/useMqttMessages";

export const useGpsStatus = (gpsChip) => {
  const { publishMessage, isConnected } = useMqttPublish();
  const [gpsStatus, setGpsStatus] = useState(gpsChip ? "Aguardando..." : "Desconectado");
  const [mode, setMode] = useState(gpsChip ? "Aguardando..." : null);
  const [lastCheckTime, setLastCheckTime] = useState(null);
  const timeoutRef = useRef(null);
  const intervalRef = useRef(null);
  const currentStatusRef = useRef(gpsChip ? "Aguardando..." : "Desconectado");
  
  // Atualizar a ref quando o status mudar
  useEffect(() => {
    currentStatusRef.current = gpsStatus;
  }, [gpsStatus]);

  // Se não há chip_id, não inscrever no MQTT
  const topicsToSubscribe = gpsChip ? [`webserver/${gpsChip}/sts`] : [];
  useMqttSubscribe(topicsToSubscribe);

  // Gerenciar mensagens recebidas
  useMqttMessages((topic, message) => {
    if (topic === `webserver/${gpsChip}/sts`) {
      const status = message.status || "Status desconhecido";
      const mode = message.mode;

      setGpsStatus(status);
      currentStatusRef.current = status; // Atualiza a ref imediatamente
      setMode(mode);

      setLastCheckTime(new Date());
      clearTimeout(timeoutRef.current);
    }
  });

  const handleCheckGpsStatus = () => {
    // Não fazer nada se não tiver chip_id
    if (!gpsChip) {
      return;
    }

    if (isConnected) {
      publishMessage(
        `kart/${gpsChip}/sts`,
        JSON.stringify({ command: "status" }),
      );

      // Usa a ref em vez do estado
      if (currentStatusRef.current !== "Conectado") {
        setGpsStatus("Aguardando...");
        currentStatusRef.current = "Aguardando...";

        timeoutRef.current = setTimeout(() => {
          // Verifica a ref novamente no timeout
          if (currentStatusRef.current !== "Conectado") {
            setGpsStatus("Desconectado");
            currentStatusRef.current = "Desconectado";
          }
        }, 10000);
      }

      setLastCheckTime(new Date());
    }
  };

  function changeMode(speed) {
    // Não fazer nada se não tiver chip_id
    if (!gpsChip) {
      return;
    }

    setMode("Confirmando");
    if (isConnected) {
      publishMessage(`kart/${gpsChip}/mode`, String(speed));
    } else {
      alert("MQTT desconectado. Tentando reconectar...");
    }

    return { changeMode };
  }

  // Realizar uma verificação inicial e configurar reconexão automática
  useEffect(() => {
    // Só verificar se tiver chip_id
    if (isConnected && gpsChip) {
      handleCheckGpsStatus();
    }

    // Configurar reconexão automática apenas se tiver chip_id
    if (gpsChip) {
      intervalRef.current = setInterval(() => {
        handleCheckGpsStatus();
      }, 15000); // A cada 15 segundos
    }

    return () => {
      clearTimeout(timeoutRef.current); // Limpa timeout ao desmontar
      clearInterval(intervalRef.current); // Limpa intervalo ao desmontar
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isConnected, gpsChip]);

  // Retornar os valores para serem usados em outro componente
  return {
    gpsStatus,
    lastCheckTime,
    mode,

    isConnected,
    handleCheckGpsStatus,
    changeMode,
  };
};
