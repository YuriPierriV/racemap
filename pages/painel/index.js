import React, { useEffect, useState, useRef } from "react";
import { BASE_URL } from "pages/utils/config";
import TrackTable from "pages/lista/TrackTable";
import EditForm from "pages/lista/EditForm";
import CanvasDisplay from "pages/lista/CanvasDisplay";
import { useRouter } from "next/router";
import { drawFull } from "pages/utils/canvasUtils";

const AsidePanel = () => {
  const [selectedMenu, setSelectedMenu] = useState(null);
  const [isTraçadosOpen, setIsTraçadosOpen] = useState(false); // Para controlar o dropdown de Traçados
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({});
  const [listTrack, setListTrack] = useState([]);
  const [dropdownOpen, setDropdownOpen] = useState(null);
  const [selectedTrack, setSelectedTrack] = useState(null);
  const [padding, setPadding] = useState(50);
  const [curveIntensity, setCurveIntensity] = useState(0.2);
  const [rotation, setRotation] = useState(0);
  const canvasRef = useRef(null);

  const router = useRouter();

  useEffect(() => {
    fetchListTrack();
  }, []);

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

  const fetchListTrack = async () => {
    try {
      const response = await fetch(`${BASE_URL}/api/v1/tracks`);
      const data = await response.json();
      const adjustedData = data.map((track) => ({
        ...track,
        created_at: adjustTimezone(track.created_at),
      }));
      setListTrack(adjustedData);
    } catch (error) {
      console.error("Erro:", error);
    }
  };

  const adjustTimezone = (createdAt) => {
    const date = new Date(createdAt);
    date.setHours(date.getHours() - 3);
    return date.toISOString();
  };

  const fetchTrackDetails = (trackId) => {
    const track = listTrack.find((t) => t.id === trackId);

    if (track) {
      setSelectedTrack(track);
    } else {
      console.error("Track não encontrado:", trackId);
    }
  };

  const deleteTrack = async (trackId) => {
    try {
      const response = await fetch(`${BASE_URL}/api/v1/tracks/${trackId}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: trackId }),
      });

      if (!response.ok) throw new Error("Erro ao deletar track");

      setListTrack((prevList) =>
        prevList.filter((track) => track.id !== trackId),
      );
      setSelectedTrack(null);
    } catch (error) {
      console.error("Erro:", error.message);
    }
  };

  const updateTrack = async (updatedData) => {
    try {
      const response = await fetch(
        `${BASE_URL}/api/v1/tracks/${updatedData.id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(updatedData),
        },
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error("Erro ao atualizar track: " + errorData.error);
      }

      setListTrack((prevList) =>
        prevList.map((track) =>
          track.id === updatedData.id ? { ...track, ...updatedData } : track,
        ),
      );

      setIsEditing(false);
      setFormData({});
    } catch (error) {
      console.error("Erro:", error.message);
    }
  };

  const handleTraçadosClick = () => {
    setIsTraçadosOpen((prev) => !prev); // Expande ou recolhe o dropdown de Traçados
  };

  return (
    <div className="flex h-screen">
      <aside className="w-64 bg-gray-800 text-white flex flex-col h-full">
        <div id="Main" className="flex flex-col justify-between h-full bg-gray-900">
          <div>
            <div className="hidden xl:flex justify-center py-6 px-3 text-center items-center space-x-3">
              <p className="text-lg leading-5 text-white">Painel</p>
            </div>
            <div className="mt-6 flex flex-col justify-start items-center border-b border-gray-600 w-full">
              <button
                onClick={() => setSelectedMenu("dashboard")}
                className="flex justify-start items-center w-full p-6 space-x-6 focus:outline-none text-white focus:text-indigo-400 rounded"
              >
                <p className="text-sm leading-4 uppercase">Painel</p>
              </button>
            </div>

            <div className="flex flex-col justify-start items-center border-b border-gray-600 w-full">
              <button
                onClick={handleTraçadosClick}
                className="flex justify-start items-center w-full p-6 space-x-6 focus:outline-none text-white focus:text-indigo-400 rounded"
              >
                <p className="text-sm leading-5 uppercase">Traçados</p>
              </button>

              {isTraçadosOpen && (
                <div className="ml-6">
                  <button
                    onClick={() => setSelectedMenu("criar")}
                    className="block py-2 text-sm leading-4 text-white hover:text-indigo-400"
                  >
                    Criar Traçados
                  </button>
                  <button
                    onClick={() => setSelectedMenu("gerenciar")}
                    className="block py-2 text-sm leading-4 text-white hover:text-indigo-400"
                  >
                    Gerenciar Traçados
                  </button>
                </div>
              )}
            </div>

            <div className="flex flex-col justify-start items-center border-b border-gray-600 w-full">
              <button
                onClick={() => setSelectedMenu("corrida")}
                className="flex justify-start items-center w-full p-6 space-x-6 focus:outline-none text-white focus:text-indigo-400 rounded"
              >
                <p className="text-sm leading-4 uppercase">Corrida</p>
              </button>
            </div>
          </div>
        </div>
      </aside>

      <main className="flex-grow bg-black p-8">
        {selectedMenu === "gerenciar" && (
          <div className="container mx-auto p-4 min-h-full">
            <div className="flex justify-center min-h-full w-full">
              <div className="w-1/2 p-4">
                {!isEditing ? (
                  <TrackTable
                    listTrack={listTrack}
                    setDropdownOpen={setDropdownOpen}
                    dropdownOpen={dropdownOpen}
                    viewTrack={fetchTrackDetails}
                    deleteTrack={deleteTrack}
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
                    updateTrack={updateTrack}
                    setIsEditing={setIsEditing}
                  />
                )}
              </div>
              <div className="w-1/2 flex items-center justify-center">
                <CanvasDisplay
                  canvasRef={canvasRef}
                  track={selectedTrack}
                  width={"w-full"}
                  height={"h-[75vh] 2xl:h-[40vh]"}
                />
              </div>
            </div>
          </div>
        )}

        {/* Placeholder para Criar Traçados */}
        {selectedMenu === "criar" && (
          <div className="text-white">
            {/* Aqui você pode adicionar o conteúdo de Criar Traçados */}
            <h2 className="text-2xl font-bold">Criar Traçados</h2>
          </div>
        )}
      </main>
    </div>
  );
};

export default AsidePanel;
