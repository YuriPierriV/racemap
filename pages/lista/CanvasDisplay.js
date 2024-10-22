import React from "react";
import { useEffect } from "react";

export default function CanvasDisplay({ canvasRef, width, height }) {
  useEffect(() => {
    const handleResize = () => {
      if (canvasRef.current) {
        canvasRef.current.width = canvasRef.current.offsetWidth;
        canvasRef.current.height = canvasRef.current.offsetHeight;
      }
    };

    // Ajusta o width inicial
    handleResize();

    // Adiciona o listener para redimensionamento
    window.addEventListener("resize", handleResize);

    // Remove o listener ao desmontar o componente
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className={`border border-black dark:bg-gray-900  w-full rounded ${width} ${height}`}
      id="tracado"
    />
  );
}
