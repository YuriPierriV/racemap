// components/RaceSelector.js
import { useState, useEffect } from "react";

import { useRouter } from "next/router";

import useMqttPublish from "pages/mqtt/useMqttPublish";
import useMqttSubscribe from "pages/mqtt/useMqttSubscribe";
import useMqttMessages from "pages/mqtt/useMqttMessages";

const GpsSelector = ({ onClose }) => {
  const [listGps, setListGps] = useState([]);
  const [selectedGpsId, setSelectedGpsId] = useState(null); // Gps selecionado
  const router = useRouter();
  const [topics, setTopics] = useState(["gpsCheck"]);

  const { publishMessage, isConnected } = useMqttPublish();

  useMqttSubscribe(topics);

  const enviarCheck = () => {
    publishMessage("gpsCheck", "Lu");
  };

  useEffect(() => {
    enviarCheck();
  }, []);

  useMqttMessages((topic, message) => {
    // Verifica se o tópico é gpsCheck e atualiza a lista de GPS
    if (topic === "gpsCheck") {
      if (message === "lu") {
        return;
      }
      setListGps((prev) => [...prev, message]);
    }
  });

  return (
    <div>
      <div className="flex items-center p-4 md:p-5 border-t border-gray-200 rounded-b dark:border-gray-600">
        {isConnected ? (
          <span className="inline-flex items-center bg-green-100 text-green-800 text-xs font-medium px-2.5 py-1 rounded-full dark:bg-green-900 dark:text-green-300 my-3">
            <span className="w-2 h-2 me-1 bg-green-500 rounded-full"></span>
            Conectado
          </span>
        ) : (
          <span className="inline-flex items-center bg-red-100 text-red-800 text-xs font-medium px-2.5 py-1 rounded-full dark:bg-red-900 dark:text-red-300 my-3">
            <span className="w-2 h-2 me-1 bg-red-500 rounded-full"></span>
            Desconectado
          </span>
        )}
        {listGps.map((gps) => (
          <div
            key={gps.deviceId}
            onClick={() => setSelectedGpsId(gps.deviceId)}
            className={`border rounded cursor-pointer ${
              selectedGpsId === gps.deviceId ? "border-blue-500" : ""
            }`}
          >
            {gps.deviceId}
          </div>
        ))}
        <button
          disabled={!selectedGpsId}
          type="button"
          className={`text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800 ${
            !selectedGpsId ? "opacity-50 cursor-not-allowed" : ""
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

export default GpsSelector;
