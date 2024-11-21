// components/ModalRace.js
import Modal from "pages/components/Modal";
import GpsSelector from "pages/kart/GpsSelector";

function AddGps({ isModalOpen, onClose }) {
  return (
    <div>
      <Modal isOpen={isModalOpen} onClose={onClose} title="Adicione um GPS">
        <GpsSelector onClose={onClose} />
      </Modal>
    </div>
  );
}

export default AddGps;
