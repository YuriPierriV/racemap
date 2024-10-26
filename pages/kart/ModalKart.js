// components/ModalRace.js
import { useState } from "react";
import Modal from "pages/components/Modal";
import GpsSelector from "./GpsSelector";

function ModalKart() {
  const [isModalOpen, setIsModalOpen] = useState(true);

  const closeModal = () => setIsModalOpen(false);

  return (
    <div>
      <Modal isOpen={isModalOpen} onClose={closeModal} title="Selecione um gps">
        <GpsSelector onClose={closeModal}></GpsSelector>
      </Modal>
    </div>
  );
}

export default ModalKart;
