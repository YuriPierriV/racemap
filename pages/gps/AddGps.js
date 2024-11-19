// components/ModalRace.js
import { useState } from "react";
import Modal from "pages/components/Modal";
import GpsSelector from "pages/kart/GpsSelector";

function AddGps() {
  const [isModalOpen, setIsModalOpen] = useState(true);

  const closeModal = () => setIsModalOpen(false);

  return (
    <div>
      <Modal isOpen={isModalOpen} onClose={closeModal} title="Adicione um GPS">
        <GpsSelector onClose={closeModal}></GpsSelector>
      </Modal>
    </div>
  );
}

export default AddGps;
