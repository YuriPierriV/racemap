import React, { useEffect, useState, useRef } from 'react';
import { BASE_URL } from 'pages/utils/config';
import TrackTable from 'pages/lista/TrackTable'; // Renomeado
import EditForm from 'pages/lista/EditForm'; // Preservado, se necessário
import CanvasDisplay from 'pages/lista/CanvasDisplay';
import { drawFull } from 'pages/utils/canvasUtils';
import { useRouter } from 'next/router'; // Para navegação em Next.js

export default function Lista() {
  const [listTrack, setListTrack] = useState([]); // Renomeado
  const [dropdownOpen, setDropdownOpen] = useState(null);
  const [selectedTrack, setSelectedTrack] = useState(null); // Renomeado
  const [outerTrack, setOuterTrack] = useState([]); // Renomeado
  const [innerTrack, setInnerTrack] = useState([]); // Renomeado
  const [padding, setPadding] = useState(50);
  const [curveIntensity, setCurveIntensity] = useState(0.2);
  const [rotation, setRotation] = useState(0);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({});
  const canvasRef = useRef(null);

  const router = useRouter(); // Inicializando o roteador para navegação

  useEffect(() => {
    fetchListTrack(); // Renomeado
  }, []);

  useEffect(() => {
    if (innerTrack.length > 0 && outerTrack.length > 0) {
      drawFull(canvasRef, innerTrack, outerTrack, padding, curveIntensity, rotation);
    }
  }, [padding, curveIntensity, rotation, innerTrack, outerTrack]);

  const fetchListTrack = async () => { // Renomeado
    try {
      const response = await fetch(`${BASE_URL}/api/v1/tracks`); // URL atualizada
      const data = await response.json();
      const adjustedData = data.map(track => ({ // Renomeado
        ...track,
        created_at: adjustTimezone(track.created_at),
      }));
      setListTrack(adjustedData); // Renomeado
    } catch (error) {
      console.error('Erro:', error);
    }
  };

  const adjustTimezone = (createdAt) => {
    const date = new Date(createdAt);
    date.setHours(date.getHours() - 3);
    return date.toISOString();
  };

  const fetchTrackDetails = (trackId) => { // Renomeado
    const track = listTrack.find(t => t.id === trackId); // Renomeado

    if (track) {
      const { inner_track, outer_track, padding, curveintensity, rotation } = track; // Renomeado
      setInnerTrack(inner_track);
      setOuterTrack(outer_track);
      setPadding(padding);
      setCurveIntensity(curveintensity);
      setRotation(rotation);
    } else {
      console.error('Track não encontrado:', trackId); // Renomeado
    }
  };

  const deleteTrack = async (trackId) => { // Renomeado
    try {
      const response = await fetch(`${BASE_URL}/api/v1/tracks/${trackId}`, { // URL atualizada
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: trackId }),
      });

      if (!response.ok) throw new Error('Erro ao deletar track'); // Renomeado

      setListTrack((prevList) => prevList.filter((track) => track.id !== trackId)); // Renomeado
      setSelectedTrack(null); // Renomeado
      setOuterTrack([]);
      setInnerTrack([]);
    } catch (error) {
      console.error('Erro:', error.message);
    }
  };

  const updateTrack = async (updatedData) => { // Renomeado
    try {
      const response = await fetch(`${BASE_URL}/api/v1/tracks/${updatedData.id}`, { // URL atualizada
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedData),
      });
  
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error('Erro ao atualizar track: ' + errorData.error); // Renomeado
      }

      setListTrack((prevList) =>
        prevList.map((track) => // Renomeado
          track.id === updatedData.id
            ? { ...track, ...updatedData }
            : track
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
      <div className="container mx-auto p-4 min-h-full">
        <h1 className="text-2xl font-bold text-white mb-5">Lista de Tracks</h1> {/* Renomeado */}

        <button
          onClick={goBack}
          className="px-6 py-2 bg-yellow-500 text-white rounded-lg font-bold transition-all duration-300 transform hover:scale-105 hover:bg-yellow-600 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg absolute top-4 left-4 z-10"
        >
          Voltar
        </button>

        <div className="flex justify-center min-h-full w-full">
          <div className="w-1/2 p-4">
            {!isEditing ? (
              <TrackTable // Renomeado
                listTrack={listTrack} // Renomeado
                setDropdownOpen={setDropdownOpen}
                dropdownOpen={dropdownOpen}
                viewTrack={fetchTrackDetails} // Renomeado
                deleteTrack={deleteTrack} // Renomeado
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
                updateTrack={updateTrack} // Renomeado
                setIsEditing={setIsEditing}
              />
            )}
          </div>

          <div className="w-1/2 flex items-center justify-center">
            <CanvasDisplay canvasRef={canvasRef}
              width={"w-full"}
              height={"h-[75vh] 2xl:h-[40vh]"}>
            </CanvasDisplay>
          </div>
        </div>
      </div>
    </main>
  );
}
