import React, { useEffect, useRef } from "react";
import { drawFull } from "pages/utils/canvasUtils";

export default function CanvasDisplay({ track, width, height }) {
  const canvasRef = useRef(null); // Use useRef ao invés de createRef para evitar recriação da ref em renderizações

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
      // Redesena o conteúdo do canvas sempre que padding, curveIntensity ou rotation mudarem
      drawFull(
        canvasRef,
        track.inner_track,
        track.outer_track,
        track.padding,
        track.curveIntensity,
        track.rotation,
      );
    }
  }, [track, track?.padding, track?.curveIntensity, track?.rotation]);

  return (
    <canvas
      ref={canvasRef}
      className={`border border-black dark:bg-gray-900 rounded ${width} ${height}`}
      id="tracado"
    />
  );
}
