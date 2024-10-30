import React, { useEffect, useState } from "react";
import { applyTheme, toggleTheme } from "pages/functions/Theme"; // Importar as funções
import Painel from "pages/painel/Painel"; // Importar o componente Painel
import Traçados from "pages/painel/Tracados"; // Importar o componente Traçados
import Corrida from "pages/painel/Corrida"; // Importar o componente Corrida
import GPS from "pages/painel/GPS"; // Importar o componente GPS
import Kart from "pages/painel/Kart"; // Importar o componente Kart
import Pilotos from "pages/painel/Pilotos"; // Importar o componente Pilotos

const AsidePainel = () => {
  const [isTraçadosOpen, setIsTraçadosOpen] = useState(false);
  const [theme, setTheme] = useState("light");
  const [currentComponent, setCurrentComponent] = useState("Painel"); // Estado para o componente atual

  useEffect(() => {
    const savedTheme = applyTheme(); // Aplicar o tema salvo
    setTheme(savedTheme); // Atualiza o estado com o tema salvo
  }, []);

  const handleToggleTheme = () => {
    const newTheme = toggleTheme(theme); // Alterna o tema
    setTheme(newTheme); // Atualiza o estado com o novo tema
  };

  const refreshPage = () => {
    window.location.reload();
  };

  // Função para mudar o componente atual
  const changeComponent = (componentName) => {
    setCurrentComponent(componentName);
  };

  const renderCurrentComponent = () => {
    switch (currentComponent) {
      case "Painel":
        return <Painel />;
      case "Traçados":
        return <Traçados />;
      case "Corrida":
        return <Corrida />;
      case "GPS":
        return <GPS />;
      case "Kart":
        return <Kart />;
      case "Pilotos":
        return <Pilotos />;
      default:
        return <Painel />;
    }
  };

  return (
    <div className="flex h-screen font-roboto">
      <aside className="p-4 rounded-lg bg-background text-text dark:bg-dark-background dark:text-dark-text fixed inset-y-2 left-2 z-50 my-2 ml-2 h-[calc(100vh-32px)] w-72 rounded-xl shadow-lg border border-blue-gray-100">
        <div id="Main" className="flex flex-col justify-between h-full">
          <div>
            <div className="hidden xl:flex justify-center py-6 px-3 text-center items-center space-x-3">
              <p onClick={refreshPage} className="text-lg leading-5 cursor-pointer font-semibold">
                Racemap
              </p>
            </div>

            <div className="flex items-center justify-center p-4">
              <label className="inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  className="sr-only peer"
                  checked={theme === "dark"}
                  onChange={handleToggleTheme} // Atualizado para usar a nova função
                />
                <div className="relative w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:bg-blue-600">
                  <div
                    className={`absolute top-[2px] left-[2px] bg-white rounded-full h-5 w-5 transition-all ${
                      theme === "dark" ? "translate-x-full" : ""
                    }`}
                  ></div>
                </div>
                {/* SVG para tema claro */}
                {theme === "light" ? (
                  <svg className="w-5 h-5 fill-current text-text dark:text-dark-text ml-2" viewBox="0 0 384 512" xmlns="http://www.w3.org/2000/svg">
                    <path d="M223.5 32C100 32 0 132.3 0 256S100 480 223.5 480c60.6 0 115.5-24.2 155.8-63.4c5-4.9 6.3-12.5 3.1-18.7s-10.1-9.7-17-8.5c-9.8 1.7-19.8 2.6-30.1 2.6c-96.9 0-175.5-78.8-175.5-176c0-65.8 36-123.1 89.3-153.3c6.1-3.5 9.2-10.5 7.7-17.3s-7.3-11.9-14.3-12.5c-6.3-.5-12.6-.8-19-.8z"></path>
                  </svg>
                ) : (
                  // SVG para tema escuro
                  <svg className="w-5 h-5 fill-current text-text dark:text-dark-text ml-2" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
                    <path d="M361.5 1.2c5 2.1 8.6 6.6 9.6 11.9L391 121l107.9 19.8c5.3 1 9.8 4.6 11.9 9.6s1.5 10.7-1.6 15.2L446.9 256l62.3 90.3c3.1 4.5 3.7 10.2 1.6 15.2s-6.6 8.6-11.9 9.6L391 391 371.1 498.9c-1 5.3-4.6 9.8-9.6 11.9s-10.7 1.5-15.2-1.6L256 446.9l-90.3 62.3c-4.5 3.1-10.2 3.7-15.2 1.6s-8.6-6.6-9.6-11.9L121 391 13.1 371.1c-5.3-1-9.8-4.6-11.9-9.6s-1.5-10.7 1.6-15.2L65.1 256 2.8 165.7c-3.1-4.5-3.7-10.2-1.6-15.2s6.6-8.6 11.9-9.6L121 121 140.9 13.1c1-5.3 4.6-9.8 9.6-11.9s10.7-1.5 15.2 1.6L256 65.1 346.3 2.8c4.5-3.1 10.2-3.7 15.2-1.6zM160 256a96 96 0 1 1 192 0 96 96 0 1 1 -192 0zm224 0a128 128 0 1 0 -256 0 128 128 0 1 0 256 0z"></path>
                  </svg>
                )}
              </label>
            </div>

            <div className="mt-4 flex flex-col justify-start items-center w-full">
              <button
                onClick={() => changeComponent("Painel")}
                className="rounded-xl flex justify-start items-center w-full p-4 space-x-2 focus:outline-none text-text dark:text-dark-text focus:text-primary dark:focus:text-dark-primary hover:bg-gray-200 dark:hover:bg-gray-700 hover:opacity-75 transition duration-200"
              >
                <svg className="w-5 h-5 fill-current text-text dark:text-dark-text" viewBox="0 0 576 512" xmlns="http://www.w3.org/2000/svg">
                  <path d="M575.8 255.5c0 18-15 32.1-32 32.1h-32l.7 160.2c0 2.7-.2 5.4-.5 8.1V472c0 22.1-17.9 40-40 40H456c-1.1 0-2.2 0-3.3-.1c-1.4 .1-2.8 .1-4.2 .1H416 392c-22.1 0-40-17.9-40-40V448 384c0-17.7-14.3-32-32-32H256c-17.7 0-32 14.3-32 32v64 24c0 22.1-17.9 40-40 40H160 128.1c-1.5 0-3-.1-4.5-.2c-1.2 .1-2.4 .2-3.6 .2H104c-22.1 0-40-17.9-40-40V360c0-.9 0-1.9 .1-2.8V287.6H32c-18 0-32-14-32-32.1c0-9 3-17 10-24L266.4 8c7-7 15-8 22-8s15 2 21 7L564.8 231.5c8 7 12 15 11 24z"></path>
                </svg>
                <p className="text-sm leading-4 uppercase">Painel</p>
              </button>
            </div>

            <div className="flex flex-col justify-start items-center w-full">
              <button
                onClick={() => changeComponent("Traçados")}
                className="flex justify-start items-center w-full p-4 space-x-2 focus:outline-none text-text dark:text-dark-text focus:text-primary dark:focus:text-dark-primary rounded-xl hover:bg-gray-200 dark:hover:bg-gray-700 hover:opacity-75" 
              >
                <svg className="w-5 h-5 fill-current text-text dark:text-dark-text" viewBox="0 0 576 512" xmlns="http://www.w3.org/2000/svg">
                  <path d="M302.8 312C334.9 271.9 408 174.6 408 120C408 53.7 354.3 0 288 0S168 53.7 168 120c0 54.6 73.1 151.9 105.2 192c7.7 9.6 22 9.6 29.6 0zM416 503l144.9-58c9.1-3.6 15.1-12.5 15.1-22.3V152c0-17-17.1-28.6-32.9-22.3l-116 46.4c-.5 1.2-1 2.5-1.5 3.7c-2.9 6.8-6.1 13.7-9.6 20.6V503zM15.1 187.3C6 191 0 199.8 0 209.6V480.4c0 17 17.1 28.6 32.9 22.3L160 451.8V200.4c-3.5-6.9-6.7-13.8-9.6-20.6c-5.6-13.2-10.4-27.4-12.8-41.5l-122.6 49zM384 255c-20.5 31.3-42.3 59.6-56.2 77c-20.5 25.6-59.1 25.6-79.6 0c-13.9-17.4-35.7-45.7-56.2-77V449.4l192 54.9V255z"></path>
                </svg>
                <p className="text-sm leading-5 uppercase">Traçados</p>
              </button>
            </div>

            <div className="flex flex-col justify-start items-center w-full">
              <button
                onClick={() => changeComponent("Corrida")}
                className="flex justify-start items-center w-full p-4 space-x-2 focus:outline-none text-text dark:text-dark-text focus:text-primary dark:focus:text-dark-primary rounded-xl hover:bg-gray-200 dark:hover:bg-gray-700 hover:opacity-75" 
              >
                <p className="text-sm leading-4 uppercase">Corrida</p>
              </button>
            </div>

            <div className="flex flex-col justify-start items-center w-full">
              <button
                onClick={() => changeComponent("GPS")}
                className="flex justify-start items-center w-full p-4 space-x-2 focus:outline-none text-text dark:text-dark-text focus:text-primary dark:focus:text-dark-primary rounded-xl hover:bg-gray-200 dark:hover:bg-gray-700 hover:opacity-75" 
              >
                <svg className="w-5 h-5 fill-current text-text dark:text-dark-text" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
                  <path d="M256 0c17.7 0 32 14.3 32 32V66.7C368.4 80.1 431.9 143.6 445.3 224H480c17.7 0 32 14.3 32 32s-14.3 32-32 32H445.3C431.9 368.4 368.4 431.9 288 445.3V480c0 17.7-14.3 32-32 32s-32-14.3-32-32V445.3C143.6 431.9 80.1 368.4 66.7 288H32c-17.7 0-32-14.3-32-32s14.3-32 32-32H66.7C80.1 143.6 143.6 80.1 224 66.7V32c0-17.7 14.3-32 32-32zM128 256a128 128 0 1 0 256 0 128 128 0 1 0 -256 0zm128-80a80 80 0 1 1 0 160 80 80 0 1 1 0-160z"></path>
                </svg>
                <p className="text-sm leading-4 uppercase">GPS</p>
              </button>
            </div>

            <div className="flex flex-col justify-start items-center w-full">
              <button
                onClick={() => changeComponent("Kart")}
                className="flex justify-start items-center w-full p-4 space-x-2 focus:outline-none text-text dark:text-dark-text focus:text-primary dark:focus:text-dark-primary rounded-xl hover:bg-gray-200 dark:hover:bg-gray-700 hover:opacity-75" 
              >
                <svg className="w-5 h-5 fill-current text-text dark:text-dark-text" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
                  <path d="M135.2 117.4L109.1 192H402.9l-26.1-74.6C372.3 104.6 360.2 96 346.6 96H165.4c-13.6 0-25.7 8.6-30.2 21.4zM39.6 196.8L74.8 96.3C88.3 57.8 124.6 32 165.4 32H346.6c40.8 0 77.1 25.8 90.6 64.3l35.2 100.5c23.2 9.6 39.6 32.5 39.6 59.2V400v48c0 17.7-14.3 32-32 32H448c-17.7 0-32-14.3-32-32V400H96v48c0 17.7-14.3 32-32 32H32c-17.7 0-32-14.3-32-32V400 256c0-26.7 16.4-49.6 39.6-59.2zM128 288a32 32 0 1 0 -64 0 32 32 0 1 0 64 0zm288 32a32 32 0 1 0 0-64 32 32 0 1 0 0 64z"></path>
                </svg>
                <p className="text-sm leading-4 uppercase">Kart</p>
              </button>
            </div>

            <div className="flex flex-col justify-start items-center w-full">
              <button
                onClick={() => changeComponent("Pilotos")}
                className="flex justify-start items-center w-full p-4 space-x-2 focus:outline-none text-text dark:text-dark-text focus:text-primary dark:focus:text-dark-primary rounded-xl hover:bg-gray-200 dark:hover:bg-gray-700 hover:opacity-75" 
              >
                <svg className="w-5 h-5 fill-current text-text dark:text-dark-text" viewBox="0 0 448 512" xmlns="http://www.w3.org/2000/svg">
                  <path d="M224 256A128 128 0 1 0 224 0a128 128 0 1 0 0 256zm-45.7 48C79.8 304 0 383.8 0 482.3C0 498.7 13.3 512 29.7 512H418.3c16.4 0 29.7-13.3 29.7-29.7C448 383.8 368.2 304 269.7 304H178.3z"></path>
                </svg>
                <p className="text-sm leading-4 uppercase">Pilotos</p>
              </button>
            </div>
          </div>
        </div>
      </aside>

      {/* Área para renderizar o componente atual */}
      <main className="flex-grow ml-72 p-4">
        {renderCurrentComponent()}
      </main>
    </div>
  );
};

export default AsidePainel;
