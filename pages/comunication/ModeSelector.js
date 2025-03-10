import useMqttPublish from "pages/mqtt/useMqttPublish";

export const translateMode = (mode) => {
  switch (mode) {
    case 1:
      return "Normal";
    case 10:
      return "Rápido";
    case 20:
      return "Corrida";
    case 0:
      return "Pausado";
    case "Confirmando":
      return "Confirmando";
    default:
      return "Aguardando";
  }
};

export const useChangeMode = () => {
  const { publishMessage, isConnected } = useMqttPublish();

  const changeMode = (mode, gpsChip) => {
    if (isConnected) {
      publishMessage(`kart/${gpsChip}/mode`, String(mode));
    } else {
      alert("MQTT desconectado. Tentando reconectar...");
    }
  };

  return { changeMode };
};
