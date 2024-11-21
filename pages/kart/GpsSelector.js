// components/RaceSelector.js
import { useState } from "react";

const GpsSelector = ({ onClose }) => {
  const [gpsChip, setGpsChip] = useState("");
  const [loading, setLoading] = useState(false);

  const AddChip = async () => {
    if (!gpsChip) return;

    setLoading(true); // Indica que a ação está em andamento

    try {
      const response = await fetch("/api/v1/chips", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ chipId: gpsChip }),
      });

      if (!response.ok) {
        throw new Error("Erro ao adicionar o chip");
      }

      onClose();
      // Reseta o input após o sucesso
      setGpsChip("");
    } catch (error) {
      console.error(error.message);
      alert("Erro ao adicionar o chip. Tente novamente.");
    } finally {
      setLoading(false); // Finaliza o estado de carregamento
    }
  };

  return (
    <div>
      <div className="flex flex-col p-4 md:p-5 border-t border-gray-200 rounded-b dark:border-gray-600">
        {/* Input para receber o GPS Chip */}
        <label
          htmlFor="gpsChipInput"
          className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
        >
          Insira o GPS Chip
        </label>
        <input
          id="gpsChipInput"
          type="text"
          value={gpsChip}
          onChange={(e) => setGpsChip(e.target.value)}
          className="mb-4 p-2.5 w-full text-sm text-gray-900 bg-gray-50 rounded-lg border border-gray-300 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
          placeholder="Digite o GPS Chip"
        />

        <div className="flex items-center">
          <button
            onClick={AddChip}
            disabled={!gpsChip || loading}
            type="button"
            className={`text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800 ${
              !gpsChip || loading ? "opacity-50 cursor-not-allowed" : ""
            }`}
          >
            {loading ? "Adicionando..." : "Adicionar"}
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
    </div>
  );
};

export default GpsSelector;
