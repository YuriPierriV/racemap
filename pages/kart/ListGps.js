import React, { useEffect, useState } from "react";
import { GpsStatus } from "../comunication/StatusGps";
import AddGps from "pages/gps/AddGps";
import { translateMode } from "../comunication/ModeSelector";
import { useChangeMode } from "../comunication/ModeSelector";

export const GpsList = () => {
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
      <div className="flex flex-col group bg-white shadow-lg shadow-gray-200 rounded-xl p-2.5 transition-all duration-500 hover:shadow-gray-300">
        <div className="overflow-x-auto">
          <div className="min-w-full inline-block align-middle">
            <div className="overflow-hidden">
              {loading ? (
                <p>Loading...</p>
              ) : (
                <table className="min-w-full rounded-xl">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="p-5 text-left text-sm leading-6 font-semibold text-gray-900 capitalize">
                        Chip
                      </th>
                      <th className="p-5 text-left text-sm leading-6 font-semibold text-gray-900 capitalize">
                        Status
                      </th>
                      <th className="p-5 text-left text-sm leading-6 font-semibold text-gray-900 capitalize">
                        Modo
                      </th>
                      <th className="p-5 text-left text-sm leading-6 font-semibold text-gray-900 capitalize rounded-t-xl">
                        Ações
                      </th>
                      <th className=" text-left text-sm leading-6 font-semibold text-gray-900 capitalize rounded-t-xl">
                        <button
                          onClick={configKart}
                          className="rounded-lg text-center w-full text-gray-900  font-semibold text-lg transition-all duration-500 align-middle"
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
                        <td className="p-5 whitespace-nowrap text-sm leading-6 font-medium text-gray-900">
                          {translateMode(gpsStatus[gps.chip_id]?.mode)}
                        </td>

                        <td className="p-5">
                          <div className="flex items-center gap-1">
                            <button
                              className="p-1 rounded-full group transition-all duration-500 flex item-center text-gray-900"
                              onClick={() => changeModeAtt(0, gps.chip_id)}
                            >
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 24 24"
                                strokeWidth="1.5"
                                stroke="currentColor"
                                className="size-6 text-gray-900"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  d="M14.25 9v6m-4.5 0V9M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
                                />
                              </svg>
                            </button>
                            <button
                              className="p-1 rounded-full group transition-all duration-500 flex item-center text-gray-900"
                              onClick={() => changeModeAtt(1, gps.chip_id)}
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
                                  d="M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
                                />
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  d="M15.91 11.672a.375.375 0 0 1 0 .656l-5.603 3.113a.375.375 0 0 1-.557-.328V8.887c0-.286.307-.466.557-.327l5.603 3.112Z"
                                />
                              </svg>
                            </button>
                            <button
                              className="p-1  rounded-full group transition-all duration-500 flex item-center text-gray-900"
                              onClick={() => changeModeAtt(10, gps.chip_id)}
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
                                  d="M3 8.689c0-.864.933-1.406 1.683-.977l7.108 4.061a1.125 1.125 0 0 1 0 1.954l-7.108 4.061A1.125 1.125 0 0 1 3 16.811V8.69ZM12.75 8.689c0-.864.933-1.406 1.683-.977l7.108 4.061a1.125 1.125 0 0 1 0 1.954l-7.108 4.061a1.125 1.125 0 0 1-1.683-.977V8.69Z"
                                />
                              </svg>
                            </button>
                            <button
                              className="p-1 pe-3 rounded-full group transition-all duration-500 flex item-center text-gray-900"
                              onClick={() => changeModeAtt(20, gps.chip_id)}
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
                                  d="M15.59 14.37a6 6 0 0 1-5.84 7.38v-4.8m5.84-2.58a14.98 14.98 0 0 0 6.16-12.12A14.98 14.98 0 0 0 9.631 8.41m5.96 5.96a14.926 14.926 0 0 1-5.841 2.58m-.119-8.54a6 6 0 0 0-7.381 5.84h4.8m2.581-5.84a14.927 14.927 0 0 0-2.58 5.84m2.699 2.7c-.103.021-.207.041-.311.06a15.09 15.09 0 0 1-2.448-2.448 14.9 14.9 0 0 1 .06-.312m-2.24 2.39a4.493 4.493 0 0 0-1.757 4.306 4.493 4.493 0 0 0 4.306-1.758M16.5 9a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0Z"
                                />
                              </svg>
                            </button>
                            <button
                              className="p-2 rounded-full group transition-all duration-500 flex item-center text-gray-900"
                              onClick={() => deleteChip(gps.chip_id)}
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
                                  d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0"
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

export default GpsList;
