import { useState, useEffect } from "react";
import TrackCard from "./TrackCard";
import { BASE_URL } from "pages/utils/config";
import React from "react";
import { useRouter } from "next/router";

function ModalRace() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [listTrack, setListTrack] = useState([]);
  const [selectedTrackId, setSelectedTrackId] = useState(null);

  const router = useRouter();

  useEffect(() => {
    fetchListTrack();
  }, []);

  const adjustTimezone = (createdAt) => {
    const date = new Date(createdAt);
    date.setHours(date.getHours() - 3);
    return date.toISOString();
  };

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

  const handleSelectTrack = (trackId) => {
    setSelectedTrackId(trackId);
  };

  const handleCreate = async () => {
    if (selectedTrackId) {
      try {
        // Monta os dados para o envio
        const raceData = {
          track_id: selectedTrackId,
          status: "inicial", // Status padrão
        };

        // Faz a requisição POST para o backend
        const response = await fetch("/api/v1/races", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(raceData),
        });

        if (response.ok) {
          const data = await response.json();

          if (data.link) {
            router.push(`/race/${data.link}`);
          }
        } else {
          const errorData = await response.json();
          console.error("Erro ao criar race:", errorData.error);
        }
      } catch (error) {
        console.error("Erro ao conectar com o backend:", error);
      }
    }

    // Fecha o modal após a ação (pode ser fechado antes ou depois do redirecionamento, se preferir)
    closeModal();
  };

  const openModal = () => {
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedTrackId(null);
  };

  return (
    <div>
      {/* Botão para abrir o modal */}
      <button
        onClick={openModal}
        className="block text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
        type="button"
      >
        Iniciar Corrida
      </button>

      {/* Modal */}
      {isModalOpen && (
        <div
          id="static-modal"
          className="fixed top-0 right-0 left-0 z-50 flex justify-center items-center w-full h-full bg-black bg-opacity-50"
        >
          <div className="relative p-4 w-full max-w-2xl">
            <div className="relative bg-white rounded-lg shadow dark:bg-gray-700">
              <div className="flex items-center justify-between p-4 md:p-5 border-b rounded-t dark:border-gray-600">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Selecione um traçado
                </h3>
                <button
                  type="button"
                  onClick={closeModal}
                  className="text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm w-8 h-8 ms-auto inline-flex justify-center items-center dark:hover:bg-gray-600 dark:hover:text-white"
                >
                  <svg
                    className="w-3 h-3"
                    aria-hidden="true"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 14 14"
                  >
                    <path
                      stroke="currentColor"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M1 1l6 6m0 0l6 6M7 7l6-6M7 7l-6 6"
                    />
                  </svg>
                  <span className="sr-only">Fechar</span>
                </button>
              </div>

              {/* Adicionando a rolagem no TracksCard */}
              <div className="max-h-80 overflow-y-auto ">
                <div className="grid grid-cols-3 gap-3 px-3 h-full py-3">
                  {listTrack.map((track) => (
                    <div
                      onClick={() => handleSelectTrack(track.id)}
                      className={` border rounded cursor-pointer ${
                        selectedTrackId === track.id ? "border-blue-500" : ""
                      }`}
                    >
                      <TrackCard track={track}></TrackCard>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex items-center p-4 md:p-5 border-t border-gray-200 rounded-b dark:border-gray-600">
                <button
                  onClick={handleCreate}
                  disabled={!selectedTrackId}
                  type="button"
                  className={`text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800 ${
                    !selectedTrackId ? "opacity-50 cursor-not-allowed" : ""
                  }`}
                >
                  Iniciar
                </button>
                <button
                  onClick={closeModal}
                  type="button"
                  className="py-2.5 px-5 ms-3 text-sm font-medium text-gray-900 focus:outline-none bg-white rounded-lg border border-gray-200 hover:bg-gray-100 hover:text-blue-700 focus:z-10 focus:ring-4 focus:ring-gray-100 dark:focus:ring-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-600 dark:hover:text-white dark:hover:bg-gray-700"
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ModalRace;
