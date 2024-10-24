import React from "react";
import CanvasDisplay from "pages/lista/CanvasDisplay";
import { drawFull } from "pages/utils/canvasUtils";
import { useEffect } from "react";

export default function TrackCard({ track }) {
  useEffect(() => {
    // Itera por todos os traços no listTrace
    const {
      canvasRef,
      inner_track,
      outer_track,
      padding,
      curveintensity,
      rotation,
    } = track;

    if (canvasRef && canvasRef.current) {
      drawFull(
        canvasRef,
        inner_track,
        outer_track,
        padding,
        curveintensity,
        rotation,
      );
    }
  }, [track]); // Garante que o efeito seja chamado sempre que listTrace mudar

  return (
    <div className="block rounded-lg bg-white shadow-[0_2px_15px_-3px_rgba(0,0,0,0.07),0_10px_20px_-2px_rgba(0,0,0,0.04)] dark:bg-neutral-700">
      <div className="flex">
        <CanvasDisplay
          canvasRef={track.canvasRef}
          width={"w-full"}
          height={"h-full"}
          track={track}
        />
      </div>
    </div>
  );
}
