import React from "react";

const SidebarButton = ({ onClick, isActive, icon, label, theme }) => {
  return (
    <button
      onClick={onClick}
      className={`flex justify-start items-center w-full p-4 space-x-2 focus:outline-none rounded-xl hover:bg-gray-200 dark:hover:bg-gray-700 hover:opacity-75 ${
        isActive
          ? "bg-gradient-to-tr from-gray-900 to-gray-800 text-white shadow-md shadow-gray-900/10"
          : "text-text dark:text-dark-text"
      }`}
      style={{ outline: 'none' }}
    >
      <svg
        className={`w-5 h-5 fill-current ${isActive ? "text-white" : theme === "light" ? "text-black" : "text-white"}`}
        viewBox="0 0 576 512"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path d={icon}></path>
      </svg>
      <p className={`text-sm leading-4 uppercase ${isActive ? 'text-white' : theme === 'light' ? 'text-black' : 'text-dark-text'}`}>
        {label}
      </p>
    </button>
  );
};

export default SidebarButton;
