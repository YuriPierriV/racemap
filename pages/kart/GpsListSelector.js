import React, { useEffect, useState } from "react";
import { GpsStatus } from "./StatusGps";
import AddGps from "pages/gps/AddGps";
import { translateMode } from "./ModeSelector";
import { useChangeMode } from "./ModeSelector";

export const GpsListSelector = ({ onClose, selectedGps }) => {
  const [gpsData, setGpsData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false); // Estado para controlar o modal
  const [gpsStatus, setGpsStatus] = useState({});

  const { changeMode } = useChangeMode(); // hook change mode

  const changeModeAtt = (mode, chip) => {
    changeMode(mode, chip);
    handleGpsStatusUpdate(chip, "Reconectando", "Confirmando");
  };

  // Função para buscar os dados
  const fetchGpsData = async () => {
    try {
      const response = await fetch("/api/v1/chips");
      const data = await response.json();

      setGpsData(data);
    } catch (error) {
      console.error("Erro ao buscar os dados de GPS:", error);
    } finally {
      setLoading(false);
    }
  };

  // Função para excluir um chip
  const deleteChip = async (chipId) => {
    try {
      const response = await fetch("/api/v1/chips", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ chipId }),
      });

      if (response.ok) {
        console.log("Chip deleted successfully");
        // Atualiza a lista de chips após a exclusão
        setGpsData((prevData) =>
          prevData.filter((chip) => chip.chip_id !== chipId),
        );
      } else {
        const errorData = await response.json();
        console.error("Erro ao excluir o chip:", errorData.error);
      }
    } catch (error) {
      console.error("Erro ao excluir o chip:", error);
    }
  };

  useEffect(() => {
    fetchGpsData();
  }, []);

  const closeModal = () => {
    fetchGpsData();
    setIsModalOpen(false); // Fecha o modal
  };

  const configKart = () => {
    setIsModalOpen(true); // Abre o modal ao gerenciar karts
  };

  const handleGpsStatusUpdate = (chipId, status, mode) => {
    setGpsStatus((prev) => ({
      ...prev,
      [chipId]: { status, mode },
    }));
  };

  return (
    <div className="">
      {isModalOpen && (
        <AddGps isModalOpen={isModalOpen} onClose={closeModal} /> // Renderiza o ModalKart se isModalOpen for true
      )}
      <div className="flex flex-col group bg-white shadow-lg shadow-gray-200  p-2.5 transition-all duration-500 hover:shadow-gray-300">
        <div className="overflow-x-auto">
          <div className="min-w-full inline-block align-middle">
            <div className="overflow-hidden">
              {loading ? (
                <p>Loading...</p>
              ) : (
                <table className="min-w-full ">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="p-5 text-left text-sm leading-6 font-semibold text-gray-900 capitalize">
                        Chip
                      </th>
                      <th className="p-5 text-left text-sm leading-6 font-semibold text-gray-900 capitalize">
                        Status
                      </th>

                      <th className="p-5 text-left text-sm leading-6 font-semibold text-gray-900 capitalize rounded-t-xl">
                        Ações
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-300">
                    {gpsData.map((gps) => (
                      <tr key={gps.chip_id} className="bg-white ">
                        <td className="p-5 whitespace-nowrap text-sm leading-6 font-medium text-gray-900">
                          {gps.chip_id}
                        </td>
                        <td className="p-5 whitespace-nowrap text-sm leading-6 font-medium text-gray-900">
                          <GpsStatus
                            gpsChip={gps.chip_id}
                            onStatusChange={(status, mode) =>
                              handleGpsStatusUpdate(gps.chip_id, status, mode)
                            }
                          />
                        </td>

                        <td className="p-5">
                          <div className="flex items-center gap-1">
                            <button
                              className="p-1 rounded-full group transition-all duration-500 flex item-center text-gray-900"
                              onClick={() => selectedGps(gps.chip_id)}
                            >
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 24 24"
                                strokeWidth="1.5"
                                stroke="currentColor"
                                className="size-6"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  d="M12 9v6m3-3H9m12 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
                                />
                              </svg>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GpsListSelector;
