// components/RaceSelector.js
import { useState, useEffect } from "react";
import TrackCard from "./TrackCard";
import { BASE_URL } from "pages/utils/config";
import { useRouter } from "next/router";

const RaceSelector = ({ onClose }) => {
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
        const raceData = {
          track_id: selectedTrackId,
          status: "inicial",
        };

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

    onClose(); // Close modal after action
  };

  return (
    <div>
      <div className="grid grid-cols-3 gap-3 px-3 h-full py-3">
        {listTrack.map((track) => (
          <div
            key={track.id}
            onClick={() => handleSelectTrack(track.id)}
            className={`border rounded cursor-pointer ${
              selectedTrackId === track.id ? "border-blue-500" : ""
            }`}
          >
            <TrackCard track={track} />
          </div>
        ))}
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
          onClick={onClose}
          type="button"
          className="py-2.5 px-5 ms-3 text-sm font-medium text-gray-900 focus:outline-none bg-white rounded-lg border border-gray-200 hover:bg-gray-100 hover:text-blue-700 focus:z-10 focus:ring-4 focus:ring-gray-100 dark:focus:ring-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-600 dark:hover:text-white dark:hover:bg-gray-700"
        >
          Cancelar
        </button>
      </div>
    </div>
  );
};

export default RaceSelector;
