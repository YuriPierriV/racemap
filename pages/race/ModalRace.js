// components/ModalRace.js
import { useState } from "react";
import Modal from "pages/components/Modal";
import RaceSelector from "./RaceSelector";

function ModalRace() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  return (
    <div className="inline-block">
      <button
        onClick={openModal}
        className="px-6 py-2 bg-green-500 text-white rounded-lg mr-3 font-bold transition-all duration-300 transform hover:scale-105 hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
        type="button"
      >
        Iniciar Corrida
      </button>

      <Modal
        isOpen={isModalOpen}
        onClose={closeModal}
        title="Selecione um traçado"
      >
        <RaceSelector onClose={closeModal} />
      </Modal>
    </div>
  );
}

export default ModalRace;
