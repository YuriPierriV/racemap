import { useState, useRef, useEffect } from "react";
import useMqttSubscribe from "pages/mqtt/useMqttSubscribe";
import useMqttPublish from "pages/mqtt/useMqttPublish";
import useMqttMessages from "pages/mqtt/useMqttMessages";

export const useGpsStatus = (gpsChip,) => {
  const { publishMessage, isConnected } = useMqttPublish();
  const [gpsStatus, setGpsStatus] = useState("Aguardando...");
  const [mode, setMode] = useState("Aguardando...");
  const [lastCheckTime, setLastCheckTime] = useState(null);
  const timeoutRef = useRef(null);
  const intervalRef = useRef(null);
  
  // Subscrição MQTT
  useMqttSubscribe([`webserver/${gpsChip}/sts`]);

  // Gerenciar mensagens recebidas
  useMqttMessages((topic, message) => {
    if (topic === `webserver/${gpsChip}/sts`) {
      const status = message.status || "Status desconhecido";
      const mode = message.mode;

      setGpsStatus(status);
      setMode(mode);
      
      setLastCheckTime(new Date());
      clearTimeout(timeoutRef.current); // Limpa timeout ao receber resposta
    }
  });

  // Enviar comando para verificar status do GPS
  const handleCheckGpsStatus = () => {
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

  function changeMode (speed) {
    setMode('Confirmando');
    if (isConnected) {
      publishMessage(`kart/${gpsChip}/mode`, String(speed));
    } else {
      alert("MQTT desconectado. Tentando reconectar...");
    }

  
    return { changeMode };
  };

  // Realizar uma verificação inicial e configurar reconexão automática
  useEffect(() => {
    if (isConnected) {
      handleCheckGpsStatus();
    } 

    // Configurar reconexão automática
    intervalRef.current = setInterval(() => {
      handleCheckGpsStatus();
    }, 15000); // A cada 30 segundos

    return () => {
      clearTimeout(timeoutRef.current); // Limpa timeout ao desmontar
      clearInterval(intervalRef.current); // Limpa intervalo ao desmontar
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isConnected]);



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
