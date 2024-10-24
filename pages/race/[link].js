import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import CanvasDisplay from "pages/lista/CanvasDisplay";
import AsideRace from "./AsideRace"; // Ajuste o caminho conforme necessário

const RacePage = () => {
  const router = useRouter();
  const { link } = router.query; // Captura o parâmetro dinâmico "link" da URL

  const [raceData, setRaceData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Verifica se o parâmetro "link" foi capturado corretamente
    if (link) {
      const fetchRaceData = async () => {
        try {
          const response = await fetch(`/api/v1/races/${link}`);
          if (response.ok) {
            const data = await response.json();
            setRaceData(data);
          } else {
            console.error("Erro ao buscar os dados da corrida");
          }
        } catch (error) {
          console.error("Erro de conexão com o backend", error);
        } finally {
          setLoading(false);
        }
      };

      fetchRaceData();
    }
  }, [link]);

  if (loading) {
    return <p>Carregando dados da corrida...</p>;
  }

  if (!raceData) {
    return <p>Nenhuma corrida encontrada.</p>;
  }

  const handleStartRace = () => {
    console.log("Corrida Iniciada");
  };

  const handleManageDrivers = () => {
    console.log("Gerenciar Pilotos");
  };

  const handleManageKarts = () => {
    console.log("Gerenciar Karts");
  };

  const handleEditTrack = () => {
    console.log("Editar Traçado");
  };

  const handleShowNav = (isOpen) => {
    // Lógica para abrir ou fechar a nav
  };

  return (
    <div className="flex max-h-screen h-screen">
      <AsideRace
        onStartRace={handleStartRace}
        onManageDrivers={handleManageDrivers}
        onManageKarts={handleManageKarts}
        onEditTrack={handleEditTrack}
        showNav={handleShowNav}
      />
      <main className="flex-1 ">
        <CanvasDisplay track={raceData} width={"w-full"} height={"h-screen"} />
      </main>
    </div>
  );
};

export default RacePage;
