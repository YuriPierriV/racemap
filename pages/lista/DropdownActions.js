import React, { useRef, useEffect } from "react";

export default function DropdownActions({
  trackId, // Renomeado de traceId para trackId
  dropdownOpen,
  setDropdownOpen,
  startEdit,
  deleteTrack, // Renomeado de deleteTrace para deleteTrack
  viewTrack, // Renomeado de viewTrace para viewTrack
}) {
  const buttonRef = useRef(null);
  const dropdownRef = useRef(null);

  const toggleDropdown = (trackId) => {
    // Renomeado
    setDropdownOpen(dropdownOpen === trackId ? null : trackId);
  };

  useEffect(() => {
    function handleClickOutside(event) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target)
      ) {
        setDropdownOpen(null);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [dropdownRef, buttonRef, setDropdownOpen]);

  const handleEdit = (trackId) => {
    // Renomeado
    viewTrack(trackId); // Carregar os dados do track selecionado
    startEdit(trackId); // Iniciar o modo de edição
    setDropdownOpen(null); // Fechar o dropdown
  };

  return (
    <div className="relative inline-block text-left">
      <button
        ref={buttonRef}
        onClick={() => toggleDropdown(trackId)} // Renomeado
        className="inline-flex items-center p-2 text-sm font-medium text-gray-900 rounded-lg dark:text-white hover:text-white"
        type="button"
      >
        <svg
          className="w-5 h-5"
          aria-hidden="true"
          xmlns="http://www.w3.org/2000/svg"
          fill="currentColor"
          viewBox="0 0 4 15"
        >
          <path d="M3.5 1.5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0Zm0 6.041a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0Zm0 5.959a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0Z" />
        </svg>
      </button>

      {dropdownOpen === trackId && ( // Renomeado
        <div
          ref={dropdownRef}
          className="absolute right-0 mt-2 w-32 rounded-md shadow-lg bg-gray-800 ring-1 ring-black ring-opacity-5 focus:outline-none z-10"
        >
          <div className="py-1">
            <button
              onClick={() => handleEdit(trackId)} // Chama a nova função de edição
              className="block w-full px-4 py-2 text-sm text-gray-200 text-left hover:bg-gray-700 hover:text-white"
            >
              Editar
            </button>
            <button
              onClick={() => deleteTrack(trackId)} // Renomeado de deleteTrace para deleteTrack
              className="block w-full px-4 py-2 text-sm text-gray-200 text-left hover:bg-gray-700 hover:text-white"
            >
              Excluir
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
