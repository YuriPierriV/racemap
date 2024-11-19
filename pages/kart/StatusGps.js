import { useState, useEffect, useRef } from "react";
import useMqttSubscribe from "pages/mqtt/useMqttSubscribe";
import useMqttPublish from "pages/mqtt/useMqttPublish";
import useMqttMessages from "pages/mqtt/useMqttMessages";

export const GpsStatus = ({ gpsChip }) => {
  const { publishMessage, isConnected } = useMqttPublish();
  const [gpsStatus, setGpsStatus] = useState("Aguardando...");
  const [lastCheckTime, setLastCheckTime] = useState(null);
  const timeoutRef = useRef(null);

  // Subscrição MQTT
  useMqttSubscribe([`webserver/${gpsChip}/sts`]); // Agora está diretamente no corpo do componente

  // Gerenciar mensagens recebidas
  useMqttMessages((topic, message) => {
    if (topic === `webserver/${gpsChip}/sts`) {
      console.log(message);
      setGpsStatus(message.status || "Status desconhecido");
      setLastCheckTime(new Date());
      clearTimeout(timeoutRef.current); // Limpa timeout ao receber resposta
    }
  });

  // Enviar comando para verificar status do GPS
  const handleCheckGpsStatus = () => {
    if (isConnected) {
      setGpsStatus("Aguardando resposta...");
      publishMessage(
        `kart/${gpsChip}/sts`,
        JSON.stringify({ command: "status" }),
      );
      setLastCheckTime(new Date());

      // Define timeout para marcar como desconectado se não houver resposta
      timeoutRef.current = setTimeout(() => {
        setGpsStatus("Desconectado");
      }, 10000);
    } else {
      alert("MQTT desconectado. Não é possível enviar a solicitação.");
    }
  };

  // Realizar uma verificação inicial ao montar o componente
  useEffect(() => {
    if (isConnected) {
      handleCheckGpsStatus();
    } else {
      setGpsStatus("Desconectado");
    }

    return () => {
      clearTimeout(timeoutRef.current); // Limpa timeout ao desmontar
    };
  }, [isConnected]);

  return (
    <div className="flex flex-row gap-2">
      {/* GPS status */}
      <div className="my-2">
        <p className="text-sm text-gray-900 dark:text-gray-900">
          <strong>Status:</strong> {gpsStatus}
        </p>
        {lastCheckTime && (
          <p className="text-sm text-gray-900 dark:text-gray-900">
            <strong>Última verificação:</strong>{" "}
            {lastCheckTime.toLocaleTimeString()}
          </p>
        )}
      </div>

      {/* Button to check GPS status */}
      <button
        onClick={handleCheckGpsStatus}
        className="  text-sm font-medium  text-gray-900 dark:text-gray-900"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth="1.5"
          stroke="currentColor"
          className="size-4"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99"
          />
        </svg>
      </button>
    </div>
  );
};
