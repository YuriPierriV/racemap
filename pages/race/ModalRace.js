// components/ModalRace.js
import { useState } from "react";
import Modal from "pages/components/Modal";
import RaceSelector from "./RaceSelector";

function ModalRace() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  return (
    <div>
      <button
        onClick={openModal}
        className="block text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
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
