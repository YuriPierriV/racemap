import React, { useEffect, useState } from "react";
import { drawFull } from "pages/utils/canvasUtils";
import useMqttPublish from "pages/mqtt/useMqttPublish";
import useMqttSubscribe from "pages/mqtt/useMqttSubscribe";
import useMqttMessages from "pages/mqtt/useMqttMessages";

export default function CanvasDisplay({ track, width, height, gps = [] }) {
  const canvasRef = React.createRef(); // Adiciona a referência de canvasRef
  const [messages, setMessages] = useState(["teste"]); //historico das mensagens do gps
  const [positions, setPositions] = useState({});

  useMqttMessages((topic, message) => {
    const parsedMessage = JSON.parse(message); // Parseia a mensagem para JSON
    const { deviceId, lat, long } = parsedMessage;

    // Atualiza o histórico de mensagens
    setMessages((prevMessages) => {
      const updatedMessages = [message, ...prevMessages];
      return updatedMessages.slice(0, 10); // Mantém apenas as 10 mais recentes
    });

    // Atualiza as posições por deviceId
    setPositions((prevPositions) => {
      const updatedPositions = { ...prevPositions };

      if (!updatedPositions[deviceId]) {
        // Se o deviceId ainda não existir, inicializa uma nova lista
        updatedPositions[deviceId] = [];
      }

      // Adiciona a nova posição à lista correspondente ao deviceId
      updatedPositions[deviceId] = [
        ...updatedPositions[deviceId],
        { lat, long },
      ].slice(-1);

      return updatedPositions;
    });
  });

  useMqttSubscribe([`webserver/${gps}`]);

  useEffect(() => {
    const handleResize = () => {
      if (canvasRef.current && track) {
        // Ajusta as dimensões do canvas
        canvasRef.current.width = canvasRef.current.offsetWidth;
        canvasRef.current.height = canvasRef.current.offsetHeight;

        // Redesena o conteúdo do canvas após o resize
        drawFull(
          canvasRef,
          track.inner_track,
          track.outer_track,
          track.padding,
          track.curveIntensity,
          track.rotation,
        );
      }
    };

    // Ajusta o width inicial e redesenha
    handleResize();

    // Adiciona o listener para redimensionamento
    window.addEventListener("resize", handleResize);

    // Remove o listener ao desmontar o componente
    return () => window.removeEventListener("resize", handleResize);
  }, [track]);

  useEffect(() => {
    if (track) {
      drawFull(
        canvasRef,
        track.inner_track,
        track.outer_track,
        track.padding,
        track.curveIntensity,
        track.rotation,
        positions,
      );
    }
  }, [track, positions]);

  return (
    <canvas
      ref={canvasRef}
      className={`border border-black dark:bg-gray-900 rounded ${width} ${height}`}
      id="tracado"
    />
  );
}
