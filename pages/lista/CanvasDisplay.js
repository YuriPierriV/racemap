import React from 'react';

export default function CanvasDisplay({ canvasRef }) {
  return (
    <div className="w-1/2 h-full">
      <canvas
        ref={canvasRef}
        className="border border-black dark:bg-gray-900 h-3/4 w-full rounded 2xl:h-2/5"
        id="tracado"
      />
    </div>
  );
}
