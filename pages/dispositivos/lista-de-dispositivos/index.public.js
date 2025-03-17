import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import LayoutMainPainel from "pages/components/main-painel";
import AddNewDevice from "./_add-new-device";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import useSWR from "swr";
import CardDevice from "./_device-card";

async function fetchAPI(key) {
  const response = await fetch(key);
  const responseBody = await response.json(); //salva o body da requisição
  return responseBody;
}

export default function ListaDeDispositivos() {
  const { data, error, isLoading } = useSWR("/api/v1/devices", fetchAPI,{

  });

  
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
            <p>Nenhum dispositivo encontrado.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {data.map((device) => (
                <CardDevice device={device}></CardDevice>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="conectados">
          {isLoading ? (
            <p>Carregando dispositivos...</p>
          ) : error ? (
            <p className="text-red-500">{error}</p>
          ) : data.length === 0 ? (
            <p>Nenhum dispositivo encontrado.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {data.map((device) => (
                <CardDevice device={device} filter={"conectados"}></CardDevice>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="desconectados">
          {isLoading ? (
            <p>Carregando dispositivos...</p>
          ) : error ? (
            <p className="text-red-500">{error}</p>
          ) : data.length === 0 ? (
            <p>Nenhum dispositivo encontrado.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {data.map((device) => (
                <CardDevice device={device} filter={"desconectados"}></CardDevice>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </LayoutMainPainel>
  );
}
