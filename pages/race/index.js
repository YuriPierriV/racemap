import React, { useEffect, useState, useRef } from "react";
import { BASE_URL } from "pages/utils/config";
import TraceTable from "pages/lista/TraceTable";
import CanvasDisplay from "pages/lista/CanvasDisplay";
import { drawFull } from "pages/utils/canvasUtils";
import TracesCard from "./TracesCard";

export default function StartRace() {
  const [listTrace, setListTrace] = useState([]);

  useEffect(() => {
    fetchListTrace();
  }, []);

  const adjustTimezone = (createdAt) => {
    const date = new Date(createdAt);
    date.setHours(date.getHours() - 3);
    return date.toISOString();
  };

  const fetchListTrace = async () => {
    try {
      const response = await fetch(`${BASE_URL}/api/v1/getsavedtraces`);
      const data = await response.json();

      const adjustedData = data.map((trace) => ({
        ...trace,
        created_at: adjustTimezone(trace.created_at),
        canvasRef: React.createRef(), // Adiciona a referência de canvasRef
      }));

      setListTrace(adjustedData);
    } catch (error) {
      console.error("Erro:", error);
    }
  };

  return (
    <main className="bg-slate-700 h-screen w-screen ">
      <div className="container mx-auto py-10">
        <TracesCard listTrace={listTrace}></TracesCard>
      </div>
    </main>
  );
}
