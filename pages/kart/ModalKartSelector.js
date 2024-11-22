// components/ModalRace.js
import Modal from "pages/components/Modal";
import GpsSelector from "pages/kart/GpsSelector";
import GpsListSelector from "./GpsListSelector";

function ModalKartSelector({ isModalOpen, onClose, selectedGps }) {
  return (
    <div>
      <Modal isOpen={isModalOpen} onClose={onClose} title="Adicione um GPS">
        <GpsListSelector onClose={onClose} selectedGps={selectedGps} />
      </Modal>
    </div>
  );
}

export default ModalKartSelector;
