import LayoutMainPainel from "pages/components/main-painel";
import AddNewDevice from "./lista-de-dispositivos/_add-new-device";
import AddDeviceCard from "./lista-de-dispositivos/_add-device-card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Empty, EmptyHeader, EmptyMedia, EmptyTitle, EmptyDescription, EmptyContent } from "@/components/ui/empty";
import { Radio, Wifi, WifiOff } from "lucide-react";
import useSWR from "swr";
import CardDevice from "./lista-de-dispositivos/_device-card";

async function fetchAPI(key) {
  const response = await fetch(key);
  const responseBody = await response.json(); //salva o body da requisição
  return responseBody;
}

export default function ListaDeDispositivos() {
  const { data, error, isLoading } = useSWR("/api/v1/devices", fetchAPI, {});

  return (
    <LayoutMainPainel>
      <div className="flex justify-between">
        <h1>Dispositivos</h1>
        <AddNewDevice text={"Adicionar novo"} Button={Button} />
      </div>

      <Tabs defaultValue="all">
        <TabsList className="mb-5">
          <TabsTrigger value="all">Todos</TabsTrigger>
          <TabsTrigger value="conectados">Conectados</TabsTrigger>
          <TabsTrigger value="desconectados">Desconectados</TabsTrigger>
        </TabsList>

        <TabsContent value="all">
          {isLoading ? (
            <p>Carregando dispositivos...</p>
          ) : error ? (
            <p className="text-red-500">{error}</p>
          ) : data.length === 0 ? (
            <Empty className="border-2">
              <EmptyHeader>
                <EmptyMedia variant="icon">
                  <Radio />
                </EmptyMedia>
                <EmptyTitle>Nenhum dispositivo cadastrado</EmptyTitle>
                <EmptyDescription>
                  Adicione seu primeiro dispositivo GPS para começar a rastrear traçados e monitorar corridas em tempo real.
                </EmptyDescription>
              </EmptyHeader>
              <EmptyContent>
                <AddNewDevice text="Adicionar Dispositivo" Button={Button} />
              </EmptyContent>
            </Empty>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {data.map((device) => (
                <CardDevice device={device} key={device.id}></CardDevice>
              ))}
              <AddDeviceCard />
            </div>
          )}
        </TabsContent>

        <TabsContent value="conectados">
          {isLoading ? (
            <p>Carregando dispositivos...</p>
          ) : error ? (
            <p className="text-red-500">{error}</p>
          ) : data.filter(device => device.status === 'online').length === 0 ? (
            <Empty className="border-2">
              <EmptyHeader>
                <EmptyMedia variant="icon">
                  <Wifi />
                </EmptyMedia>
                <EmptyTitle>Nenhum dispositivo conectado</EmptyTitle>
                <EmptyDescription>
                  Não há dispositivos online no momento. Certifique-se de que os dispositivos estão ligados e com conexão.
                </EmptyDescription>
              </EmptyHeader>
            </Empty>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {data.map((device) => (
                <CardDevice
                  device={device}
                  filter={"conectados"}
                  key={device.id}
                ></CardDevice>
              ))}
              <AddDeviceCard />
            </div>
          )}
        </TabsContent>

        <TabsContent value="desconectados">
          {isLoading ? (
            <p>Carregando dispositivos...</p>
          ) : error ? (
            <p className="text-red-500">{error}</p>
          ) : data.filter(device => device.status === 'offline').length === 0 ? (
            <Empty className="border-2">
              <EmptyHeader>
                <EmptyMedia variant="icon">
                  <WifiOff />
                </EmptyMedia>
                <EmptyTitle>Nenhum dispositivo desconectado</EmptyTitle>
                <EmptyDescription>
                  Ótimo! Todos os seus dispositivos estão online e funcionando corretamente.
                </EmptyDescription>
              </EmptyHeader>
            </Empty>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {data.map((device) => (
                <CardDevice
                  device={device}
                  filter={"desconectados"}
                  key={device.id}
                ></CardDevice>
              ))}
              <AddDeviceCard />
            </div>
          )}
        </TabsContent>
      </Tabs>
    </LayoutMainPainel>
  );
}
