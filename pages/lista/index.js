import React, { useEffect, useState, useRef } from 'react';
import { BASE_URL } from 'pages/utils/config';
import TraceTable from 'pages/lista/TraceTable';
import EditForm from 'pages/lista/EditForm';
import CanvasDisplay from 'pages/lista/CanvasDisplay';
import { drawFull } from 'pages/utils/canvasUtils';
import { useRouter } from 'next/router'; // Para navegação em Next.js

export default function Lista() {
  const [listTrace, setListTrace] = useState([]);
  const [dropdownOpen, setDropdownOpen] = useState(null);
  const [selectedTrace, setSelectedTrace] = useState(null);
  const [outerTrace, setOuterTrace] = useState([]);
  const [innerTrace, setInnerTrace] = useState([]);
  const [padding, setPadding] = useState(50);
  const [curveIntensity, setCurveIntensity] = useState(0.2);
  const [rotation, setRotation] = useState(0);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({});
  const canvasRef = useRef(null);

  const router = useRouter(); // Inicializando o roteador para navegação

  useEffect(() => {
    fetchListTrace();
  }, []);

  useEffect(() => {
    if (innerTrace.length > 0 && outerTrace.length > 0) {
      drawFull(canvasRef, innerTrace, outerTrace, padding, curveIntensity, rotation);
    }
  }, [padding, curveIntensity, rotation, innerTrace, outerTrace]);

  const fetchListTrace = async () => {
    try {
      const response = await fetch(`${BASE_URL}/api/v1/getsavedtraces`);
      const data = await response.json();
      const adjustedData = data.map(trace => ({
        ...trace,
        created_at: adjustTimezone(trace.created_at),
      }));
      setListTrace(adjustedData);
    } catch (error) {
      console.error('Erro:', error);
    }
  };

  const adjustTimezone = (createdAt) => {
    const date = new Date(createdAt);
    date.setHours(date.getHours() - 3);
    return date.toISOString();
  };

  const fetchTraceDetails = (traceId) => {
    const trace = listTrace.find(t => t.id === traceId);

    if (trace) {
      const { inner_trace, outer_trace, padding, curveintensity, rotation } = trace;
      setInnerTrace(inner_trace);
      setOuterTrace(outer_trace);
      setPadding(padding);
      setCurveIntensity(curveintensity);
      setRotation(rotation);
    } else {
      console.error('Traçado não encontrado:', traceId);
    }
  };

  const deleteTrace = async (traceId) => {
    try {
      const response = await fetch(`${BASE_URL}/api/v1/deletetrace`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: traceId }),
      });

      if (!response.ok) throw new Error('Erro ao deletar traçado');

      setListTrace((prevList) => prevList.filter((trace) => trace.id !== traceId));
      setSelectedTrace(null);
      setOuterTrace([]);
      setInnerTrace([]);
    } catch (error) {
      console.error('Erro:', error.message);
    }
  };

  const updateTrace = async (updatedData) => {
    try {
      const response = await fetch(`${BASE_URL}/api/v1/edittrace`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedData),
      });
  
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error('Erro ao atualizar traçado: ' + errorData.error);
      }

      setListTrace((prevList) =>
        prevList.map((trace) =>
          trace.id === updatedData.id
            ? { ...trace, ...updatedData }
            : trace
        )
      );
  
      setIsEditing(false);
      setFormData({});
    } catch (error) {
      console.error('Erro:', error.message);
    }
  };

  const goBack = () => {
    router.push('/');
  };

  return (
    <main className="bg-slate-700 min-h-screen relative">
      <div className="container mx-auto p-4 h-full">
        <h1 className="text-2xl font-bold text-white mb-5">Lista de Traçados</h1>

        <button
          onClick={goBack}
          className="px-6 py-2 bg-yellow-500 text-white rounded-lg font-bold transition-all duration-300 transform hover:scale-105 hover:bg-yellow-600 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg absolute top-4 left-4 z-10"
        >
          Voltar
        </button>

        <div className="flex justify-between h-full">
          {!isEditing ? (
            <TraceTable
              listTrace={listTrace}
              setDropdownOpen={setDropdownOpen}
              dropdownOpen={dropdownOpen}
              viewTrace={fetchTraceDetails}
              deleteTrace={deleteTrace}
              setIsEditing={setIsEditing}
              setFormData={setFormData}
            />
          ) : (
            <EditForm
              formData={formData}
              setFormData={setFormData}
              padding={padding}
              setPadding={setPadding}
              curveIntensity={curveIntensity}
              setCurveIntensity={setCurveIntensity}
              rotation={rotation}
              setRotation={setRotation}
              updateTrace={updateTrace}
              setIsEditing={setIsEditing}
            />
          )}

          <CanvasDisplay canvasRef={canvasRef} />
        </div>
      </div>
    </main>
  );
}
