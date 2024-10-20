import React, { useRef } from 'react';

export default function DropdownActions({
  traceId,
  dropdownOpen,
  setDropdownOpen,
  startEdit,
  deleteTrace,
}) {
  const buttonRef = useRef(null);
  const dropdownRef = useRef(null);

  const toggleDropdown = (traceId) => {
    setDropdownOpen(dropdownOpen === traceId ? null : traceId);
  };

  return (
    <div className="relative">
      <button
        ref={buttonRef}
        onClick={() => toggleDropdown(traceId)}
        className="inline-flex items-center p-2 text-sm font-medium text-gray-900 rounded-lg dark:text-white hover:text-white"
        type="button"
      >
        <svg className="w-5 h-5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 4 15">
          <path d="M3.5 1.5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0Zm0 6.041a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0Zm0 5.959a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0Z" />
        </svg>
      </button>

      {dropdownOpen === traceId && (
        <div ref={dropdownRef} className="absolute right-0 mt-2 w-28 rounded-md shadow-lg bg-gray-800">
          <ul>
            <div>
              <button
                onClick={() => startEdit(traceId)}
                className="block w-full px-4 py-2 text-left hover:bg-gray-700"
              >
                Editar
              </button>
              <button
                onClick={() => deleteTrace(traceId)}
                className="block w-full px-4 py-2 text-left hover:bg-gray-700"
              >
                Excluir
              </button>
            </div>
          </ul>
        </div>
      )}
    </div>
  );
}
