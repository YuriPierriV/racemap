import React from "react";
import CanvasDisplay from "pages/lista/CanvasDisplay";
import { drawFull } from "pages/utils/canvasUtils";
import { useEffect } from "react";

export default function TracesCard({ listTrace }) {
  useEffect(() => {
    // Itera por todos os traços no listTrace
    listTrace.forEach((trace) => {
      const {
        canvasRef,
        inner_trace,
        outer_trace,
        padding,
        curveintensity,
        rotation,
      } = trace;

      if (canvasRef && canvasRef.current) {
        drawFull(
          canvasRef,
          inner_trace,
          outer_trace,
          padding,
          curveintensity,
          rotation,
        );
      }
    });
  }, [listTrace]); // Garante que o efeito seja chamado sempre que listTrace mudar

  const startRace = (traceId) => {
    const trace = listTrace.find((t) => t.id === traceId);
    if (trace) {
    }
  };

  return (
    <div className="grid grid-cols-3 gap-3 px-3 h-full py-3">
      {listTrace.map((trace) => (
        <div className="block rounded-lg bg-white shadow-[0_2px_15px_-3px_rgba(0,0,0,0.07),0_10px_20px_-2px_rgba(0,0,0,0.04)] dark:bg-neutral-700">
          <div className="flex">
            <CanvasDisplay
              canvasRef={trace.canvasRef}
              width={"w-full"}
              height={"h-full"}
              track={trace}
            />
          </div>
        </div>
      ))}
    </div>
  );
}
