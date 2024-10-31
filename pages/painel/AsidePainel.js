import React, { useEffect, useState } from "react";
import { applyTheme, toggleTheme } from "pages/functions/Theme"; 
import Painel from "pages/painel/Painel"; 
import Traçados from "pages/painel/Tracados"; 
import Corrida from "pages/painel/Corrida"; 
import GPS from "pages/painel/GPS"; 
import Kart from "pages/painel/Kart"; 
import Pilotos from "pages/painel/Pilotos"; 
import ThemeToggle from "pages/components/ThemeToggle"; 
import SidebarButton from "pages/components/SidebarButton"; // Ajuste o caminho de importação conforme necessário

const AsidePainel = () => {
  const [theme, setTheme] = useState("light");
  const [currentComponent, setCurrentComponent] = useState("Painel");

  useEffect(() => {
    const savedTheme = applyTheme();
    setTheme(savedTheme);
  }, []);

  const handleToggleTheme = () => {
    const newTheme = toggleTheme(theme);
    setTheme(newTheme);
  };

  const refreshPage = () => {
    window.location.reload();
  };

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
    <div className="flex h-screen font-roboto bg-background dark:bg-dark-background text-text dark:text-dark-text">
      <aside className="p-4 rounded-xl bg-background text-text dark:bg-dark-background dark:text-dark-text fixed inset-y-2 left-2 z-50 my-2 ml-2 h-[calc(100vh-32px)] w-72 shadow-sm border border-gray-300 dark:border-gray-700">
        <div id="Main" className="flex flex-col justify-between h-full">
          <div>
            <div className="hidden xl:flex justify-center py-6 px-3 text-center items-center space-x-3">
              <p onClick={refreshPage} className="text-lg leading-5 cursor-pointer font-semibold">
                Racemap
              </p>
            </div>
            <ThemeToggle theme={theme} handleToggleTheme={handleToggleTheme} />
            <div className="mt-4 flex flex-col justify-start items-center w-full">
              <SidebarButton
                onClick={() => changeComponent("Painel")}
                isActive={currentComponent === "Painel"}
                icon="M575.8 255.5c0 18-15 32.1-32 32.1h-32l.7 160.2c0 2.7-.2 5.4-.5 8.1V472c0 22.1-17.9 40-40 40H456c-1.1 0-2.2 0-3.3-.1c-1.4 .1-2.8 .1-4.2 .1H416 392c-22.1 0-40-17.9-40-40V448 384c0-17.7-14.3-32-32-32H256c-17.7 0-32 14.3-32 32v64 24c0 22.1-17.9 40-40 40H160 128.1c-1.5 0-3-.1-4.5-.2c-1.2 .1-2.4 .2-3.6 .2H104c-22.1 0-40-17.9-40-40V360c0-.9 0-1.9 .1-2.8V287.6H32c-18 0-32-14-32-32.1c0-9 3-17 10-24L266.4 8c7-7 15-8 22-8s15 2 21 7L564.8 231.5c8 7 12 15 11 24z"
                label="Painel"
                theme={theme}
              />
              <SidebarButton
                onClick={() => changeComponent("Traçados")}
                isActive={currentComponent === "Traçados"}
                icon="M302.8 312C334.9 271.9 408 174.6 408 120C408 53.7 354.3 0 288 0S168 53.7 168 120c0 54.6 73.1 151.9 105.2 192c7.7 9.6 22 9.6 29.6 0zM416 503l144.9-58c9.1-3.6 15.1-12.5 15.1-22.3V152c0-17-17.1-28.6-32.9-22.3l-116 46.4c-.5 1.2-1 2.5-1.5 3.7c-2.9 6.8-6.1 13.7-9.6 20.6V503zM15.1 187.3C6 191 0 199.8 0 209.6V480.4c0 17 17.1 28.6 32.9 22.3L160 451.8V200.4c-3.5-6.9-6.7-13.8-9.6-20.6c-5.6-13.2-10.4-27.4-12.8-41.5l-122.6 49zM384 255c-20.5 31.3-42.3 59.6-56.2 77c-20.5 25.6-59.1 25.6-79.6 0c-13.9-17.4-35.7-45.7-56.2-77V449.4l192 54.9V255z"
                label="Traçados"
                theme={theme}
              />
              <SidebarButton
                onClick={() => changeComponent("Corrida")}
                isActive={currentComponent === "Corrida"}
                icon=""
                label="Corrida"
                theme={theme}
              />
              <SidebarButton
                onClick={() => changeComponent("GPS")}
                isActive={currentComponent === "GPS"}
                icon="M256 0c17.7 0 32 14.3 32 32V66.7C368.4 80.1 431.9 143.6 445.3 224H480c17.7 0 32 14.3 32 32s-14.3 32-32 32H445.3C431.9 368.4 368.4 431.9 288 445.3V480c0 17.7-14.3 32-32 32s-32-14.3-32-32V445.3C143.6 431.9 80.1 368.4 66.7 288H32c-17.7 0-32-14.3-32-32s14.3-32 32-32H66.7C80.1 143.6 143.6 80.1 224 66.7V32c0-17.7 14.3-32 32-32zM128 256a128 128 0 1 0 256 0 128 128 0 1 0 -256 0zm128-80a80 80 0 1 1 0 160 80 80 0 1 1 0-160z"
                label="GPS"
                theme={theme}
              />
              <SidebarButton
                onClick={() => changeComponent("Kart")}
                isActive={currentComponent === "Kart"}
                icon="M135.2 117.4L109.1 192H402.9l-26.1-74.6C372.3 104.6 360.2 96 346.6 96H165.4c-13.6 0-25.7 8.6-30.2 21.4zM39.6 196.8L74.8 96.3C88.3 57.8 124.6 32 165.4 32H346.6c40.8 0 77.1 25.8 90.6 64.3l35.2 100.5c23.2 9.6 39.6 32.5 39.6 59.2V400v48c0 17.7-14.3 32-32 32H448c-17.7 0-32-14.3-32-32V400H96v48c0 17.7-14.3 32-32 32H32c-17.7 0-32-14.3-32-32V400 256c0-26.7 16.4-49.6 39.6-59.2zM128 288a32 32 0 1 0 -64 0 32 32 0 1 0 64 0zm288 32a32 32 0 1 0 0-64 32 32 0 1 0 0 64z"
                label="Kart"
                theme={theme}
              />
              <SidebarButton
                onClick={() => changeComponent("Pilotos")}
                isActive={currentComponent === "Pilotos"}
                icon="M224 256A128 128 0 1 0 224 0a128 128 0 1 0 0 256zm-45.7 48C79.8 304 0 383.8 0 482.3C0 498.7 13.3 512 29.7 512H418.3c16.4 0 29.7-13.3 29.7-29.7C448 383.8 368.2 304 269.7 304H178.3z"
                label="Pilotos"
                theme={theme}
              />
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
