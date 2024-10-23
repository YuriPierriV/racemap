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
          <div className="flex ">
            <CanvasDisplay
              canvasRef={trace.canvasRef}
              width={"w-full"}
              height={"h-full"}
            />
          </div>

          <div className="p-3">
            <h5 className="mb-2 text-xl font-medium leading-tight text-neutral-800 dark:text-neutral-50">
              {trace.name}
            </h5>

            <button
              type="button"
              className="inline-block rounded-full bg-neutral-50 px-6 pb-2 pt-2.5 text-xs font-medium uppercase leading-normal text-neutral-800 shadow-[0_4px_9px_-4px_#cbcbcb] transition duration-150 ease-in-out hover:bg-neutral-100 hover:shadow-[0_8px_9px_-4px_rgba(203,203,203,0.3),0_4px_18px_0_rgba(203,203,203,0.2)] focus:bg-neutral-100 focus:shadow-[0_8px_9px_-4px_rgba(203,203,203,0.3),0_4px_18px_0_rgba(203,203,203,0.2)] focus:outline-none focus:ring-0 active:bg-neutral-200 active:shadow-[0_8px_9px_-4px_rgba(203,203,203,0.3),0_4px_18px_0_rgba(203,203,203,0.2)] dark:shadow-[0_4px_9px_-4px_rgba(251,251,251,0.3)] dark:hover:shadow-[0_8px_9px_-4px_rgba(251,251,251,0.1),0_4px_18px_0_rgba(251,251,251,0.05)] dark:focus:shadow-[0_8px_9px_-4px_rgba(251,251,251,0.1),0_4px_18px_0_rgba(251,251,251,0.05)] dark:active:shadow-[0_8px_9px_-4px_rgba(251,251,251,0.1),0_4px_18px_0_rgba(251,251,251,0.05)]"
            >
              Light
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
