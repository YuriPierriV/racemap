import React, { useEffect, useState, useRef } from "react";
import { BASE_URL } from "pages/utils/config";
import CanvasDisplay from "pages/lista/CanvasDisplay";
import EditForm from "pages/lista/EditForm";

export default function Traçados() {
  const [tracks, setTracks] = useState([]);
  const [editingTrackId, setEditingTrackId] = useState(null);
  const [selectedTrack, setSelectedTrack] = useState(null);
  const [padding, setPadding] = useState(0);
  const [curveIntensity, setCurveIntensity] = useState(0);
  const [rotation, setRotation] = useState(0);
  const [formData, setFormData] = useState({});
  const canvasRef = useRef(null);

  useEffect(() => {
    fetchTracks();
  }, []);

  // Atualiza o `selectedTrack` sempre que `padding`, `curveIntensity` ou `rotation` mudar
  useEffect(() => {
    if (selectedTrack) {
      setSelectedTrack((prevTrack) => ({
        ...prevTrack,
        padding,
        curveintensity: curveIntensity,
        rotation,
      }));
    }
  }, [padding, curveIntensity, rotation]);

  // Redesenha o traçado no CanvasDisplay sempre que o `selectedTrack` mudar
  useEffect(() => {
    if (selectedTrack && canvasRef.current) {
      drawFull(canvasRef.current, selectedTrack);
    }
  }, [selectedTrack, padding, curveIntensity, rotation]);

  const fetchTracks = async () => {
    try {
      const response = await fetch(`${BASE_URL}/api/v1/tracks`);
      const data = await response.json();
      const adjustedData = data.map((track) => ({
        ...track,
        created_at: adjustTimezone(track.created_at),
      }));
      setTracks(adjustedData);
    } catch (error) {
      console.error("Erro:", error);
    }
  };

  const adjustTimezone = (createdAt) => {
    const date = new Date(createdAt);
    date.setHours(date.getHours() - 3);
    return date.toISOString();
  };

  const handleEdit = (track) => {
    setEditingTrackId(track.id);
    setSelectedTrack(track);
    setFormData(track);
    setPadding(track.padding || 0);
    setCurveIntensity(track.curveintensity || 0);
    setRotation(track.rotation || 0);
  };

  const handleCancelEdit = () => {
    setEditingTrackId(null);
    setSelectedTrack(null);
  };

  const updateTrack = (updatedData) => {
    setTracks((prevList) =>
      prevList.map((track) =>
        track.id === updatedData.id ? { ...track, ...updatedData } : track
      )
    );
    setEditingTrackId(null);
    setSelectedTrack(updatedData);
  };

  return (
    <div className="p-2">
      <h1 className="text-2xl font-bold mb-4 text-center">Traçados</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4">
        {tracks.map((track) => (
          <div
            key={track.id}
            className={`relative overflow-hidden rounded-lg shadow-md transition-transform transform ${
              editingTrackId === track.id ? "scale-105 h-auto" : "hover:scale-105 h-[300px]"
            } ${editingTrackId === track.id 
              ? 'bg-gradient-to-b from-primary to-secondary dark:from-dark-primary dark:to-dark-secondary'
              : 'bg-gradient-to-r from-background to-secondary dark:from-dark-secondary dark:to-dark-primary'
            } text-white p-4 transition-all duration-300 ease-in-out`}
          >
            <h2 className="text-lg font-semibold mb-2">{track.name}</h2>
            <CanvasDisplay
              canvasRef={canvasRef}
              track={editingTrackId === track.id ? selectedTrack : track}
              width="w-full"
              height="h-[200px]"
            />

            {editingTrackId === track.id ? (
              <EditForm
                formData={formData}
                setFormData={setFormData}
                padding={padding}
                setPadding={setPadding}
                curveIntensity={curveIntensity}
                setCurveIntensity={setCurveIntensity}
                rotation={rotation}
                setRotation={setRotation}
                updateTrack={updateTrack}
                setIsEditing={handleCancelEdit}
              />
            ) : (
              <button
                onClick={() => handleEdit(track)}
                className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-lg transition-all duration-300 transform hover:scale-105 hover:bg-blue-600"
              >
                Editar
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
