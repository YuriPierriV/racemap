import React, { useEffect, useState } from "react";
import { GpsStatus } from "./StatusGps";

export const GpsList = () => {
  const [gpsData, setGpsData] = useState([]);
  const [loading, setLoading] = useState(true);

  // Função para buscar os dados
  const fetchGpsData = async () => {
    try {
      const response = await fetch("/api/v1/chips"); // Substitua pelo endpoint real
      const data = await response.json();
      console.log(data);
      setGpsData(data);
    } catch (error) {
      console.error("Erro ao buscar os dados de GPS:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGpsData();
  }, []);

  return (
    <div className="flex flex-col group bg-white shadow-lg shadow-gray-200 rounded-xl p-2.5 transition-all duration-500  hover:shadow-gray-300">
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
                    <th className="p-5 text-left text-sm leading-6 font-semibold text-gray-900 capitalize rounded-t-xl">
                      Ações
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-300">
                  {gpsData.map((gps) => (
                    <tr
                      key={gps.chip_id}
                      className="bg-white transition-all duration-500 hover:bg-gray-50"
                    >
                      <td className="p-5 whitespace-nowrap text-sm leading-6 font-medium text-gray-900">
                        {gps.chip_id}
                      </td>
                      <td className="p-5 whitespace-nowrap text-sm leading-6 font-medium text-gray-900">
                        <GpsStatus gpsChip={gps.chip_id} />
                      </td>

                      <td className="p-5">
                        <div className="flex items-center gap-1">
                          <button
                            className="p-2 rounded-full group transition-all duration-500 flex item-center"
                            onClick={() =>
                              console.log(`Detalhes do GPS ${gps.id}`)
                            }
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              fill="none"
                              viewBox="0 0 24 24"
                              strokeWidth="1.5"
                              stroke="red"
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
  );
};

export default GpsList;
