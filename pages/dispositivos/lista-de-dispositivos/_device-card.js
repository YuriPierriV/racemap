import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useEffect, useState } from "react";
import { useGpsStatus } from "pages/comunication/StatusGps";
import {
  CheckCircle,
  CirclePause,
  Ellipsis,
  FastForward,
  Gauge,
  Loader2,
  Play,
  Trash2,
  XCircle,
} from "lucide-react"; // Ícones
import { translateMode } from "pages/comunication/ModeSelector";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { WifiIcon } from "./_device-connected";

function DeviceModeIcon({ mode }) {
  switch (mode) {
    case 1:
      return <Play className="w-4 h-4 mr-1" />;
    case 10:
      return <FastForward className="w-4 h-4 mr-1" />;
    case 20:
      return <Gauge className="w-4 h-4 mr-1" />;
    case 0:
      return <CirclePause className="w-4 h-4 mr-1" />;
    case "Confirmando":
      return <Loader2 className="animate-spin w-4 h-4 mr-1" />;
    default:
      return <Loader2 className="animate-spin w-4 h-4 mr-1" />;
  }
}

function DeviceStatus({ gpsStatus, mode }) {
  const [wifiLevel, setWifiLevel] = useState(0);
  useEffect(() => {
    let interval;
    if (gpsStatus === "Aguardando...") {
      interval = setInterval(() => {
        setWifiLevel((prev) => (prev + 1) % 4); // Alterna entre 0,1,2,3
      }, 250);
    }
    return () => clearInterval(interval);
  }, [gpsStatus]);

  return (
    <div className="flex items-center gap-2 text-sm font-medium">
      {gpsStatus == "Conectado" ? (
        <div className="space-x-3 items-center">
          <span className="inline-flex items-center bg-green-100  text-xs font-medium px-2.5 py-1 rounded-full dark:bg-green-900  my-3">
            <CheckCircle className="w-4 h-4 text-green-500 mr-1" />
            Conectado
          </span>
          <span className="inline-flex items-center bg-primary-500 text-xs font-medium px-2.5 py-1 rounded-full  my-3">
            <DeviceModeIcon mode={mode} />
            {translateMode(mode)}
          </span>
        </div>
      ) : gpsStatus == "Aguardando..." ? (
        <span className="inline-flex items-center bg-blue-100  text-xs font-medium px-2.5 py-1 rounded-full dark:bg-blue-900  my-3">
          <WifiIcon level={wifiLevel} className={"w-4 h-4 mr-1"} />
          Conectando
        </span>
      ) : (
        <span className="inline-flex items-center bg-red-100  text-xs font-medium px-2.5 py-1 rounded-full dark:bg-red-900  my-3">
          <XCircle className="w-4 h-4 text-red-500 mr-1" />
          Desconectado
        </span>
      )}
    </div>
  );
}

export function DropdownMenuMode({ changeMode }) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="icon" size="icon">
          <Ellipsis></Ellipsis>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuLabel>Mudar velocidade</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          {[0, 1, 10, 20].map((speed) => (
            <DropdownMenuItem key={speed} onClick={() => changeMode(speed)}>
              <DeviceModeIcon mode={speed}></DeviceModeIcon>
              {translateMode(speed)}
            </DropdownMenuItem>
          ))}
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem>
            <Trash2 className="w-4 h-4 mr-1"></Trash2>
            Remover
          </DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export default function CardDevice({ device, filter }) {
  const { gpsStatus, mode, changeMode } = useGpsStatus(device.chip_id);

  if (filter == "conectados") {
    if (gpsStatus !== "Conectado") {
      return;
    }
  }
  if (filter == "desconectados") {
    if (gpsStatus == "Conectado" && gpsStatus !== "Aguardando...") {
      return;
    }
  }
  return (
    <Card key={device.id}>
      <CardHeader>
        <CardTitle>
          <div className="flex justify-between items-center">
            {device.chip_id}
            <DropdownMenuMode
              deviceId={device.chip_id}
              changeMode={changeMode}
            ></DropdownMenuMode>
          </div>
        </CardTitle>
        <CardDescription>
          <div className="flex items-center align-middle space-x-3">
            <p className="text-gray-500">Dispositivo GPS</p>
            <DeviceStatus gpsStatus={gpsStatus} mode={mode} />
          </div>
        </CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-gray-600">
          Detalhes do dispositivo podem ser adicionados aqui.
        </p>
      </CardContent>
      <CardFooter>
        <p className="text-gray-500">
          <strong>Criado em:</strong>{" "}
          {new Date(device.created_at).toLocaleString()}
        </p>
      </CardFooter>
    </Card>
  );
}
