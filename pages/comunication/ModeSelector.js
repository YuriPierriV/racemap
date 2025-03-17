

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
