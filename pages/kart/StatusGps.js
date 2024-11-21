import { useState, useEffect, useRef } from "react";
import useMqttSubscribe from "pages/mqtt/useMqttSubscribe";
import useMqttPublish from "pages/mqtt/useMqttPublish";
import useMqttMessages from "pages/mqtt/useMqttMessages";

export const GpsStatus = ({ gpsChip, onStatusChange }) => {
  const { publishMessage, isConnected } = useMqttPublish();
  const [gpsStatus, setGpsStatus] = useState("Aguardando...");
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
      if (onStatusChange) {
        onStatusChange(status, mode);
      }
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
    } else {
      alert("MQTT desconectado. Tentando reconectar...");
    }
  };

  // Realizar uma verificação inicial e configurar reconexão automática
  useEffect(() => {
    if (isConnected) {
      handleCheckGpsStatus();
    } else {
      setGpsStatus("Desconectado");
    }

    // Configurar reconexão automática
    intervalRef.current = setInterval(() => {
      handleCheckGpsStatus();
    }, 15000); // A cada 30 segundos

    return () => {
      clearTimeout(timeoutRef.current); // Limpa timeout ao desmontar
      clearInterval(intervalRef.current); // Limpa intervalo ao desmontar
    };
  }, [isConnected]);

  return (
    <div className="flex flex-row gap-2">
      {/* GPS status */}
      <div className="my-2">
        <p className="text-sm text-gray-900 dark:text-gray-900">
          {gpsStatus == "Conectado" ? (
            <span className="inline-flex items-center   text-md  font-medium px-2.5 py-1 rounded-full  text-gray-900 dark:text-gray-900 my-3">
              <span className="w-2 h-2 me-1 bg-green-500 rounded-full"></span>
              Conectado
              {lastCheckTime && (
                <p className="text-sm text-gray-700 dark:text-gray-700 ms-5">
                  {lastCheckTime.toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              )}
            </span>
          ) : (
            <span className="inline-flex items-center   text-md  font-medum px-2.5 py-1 rounded-full  text-gray-900 dark:text-gray-900 my-3">
              <span className="w-2 h-2 me-1 bg-red-500 rounded-full"></span>
              Desconectado
              {lastCheckTime && (
                <p className="text-sm text-gray-900 dark:text-gray-900 ms-5">
                  {lastCheckTime.toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              )}
            </span>
          )}
        </p>
      </div>

      {/* Button to check GPS status */}
      <button
        onClick={handleCheckGpsStatus}
        className="text-sm font-medium text-gray-900 dark:text-gray-900"
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
