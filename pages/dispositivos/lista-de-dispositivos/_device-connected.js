import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
import { WifiLow, WifiZero, WifiHigh } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useGpsStatus } from "pages/comunication/StatusGps";

export function DeviceConnectionPanel({ deviceId, onConnectionResult }) {
  const [deviceStatus, setDeviceStatus] = useState("Aguardando...");
  const [testConn, setTestConn] = useState(false);
  const connectionStateRef = useRef(null);

  useEffect(() => {
    if (deviceStatus == "Conectado") {
      onConnectionResult(true);
    } else {
      onConnectionResult(false);
    }
  }, [deviceStatus]);

  function handleCheckStatus() {
    setTestConn(true);
    if (connectionStateRef.current) {
      connectionStateRef.current();
    }
  }

  return (
    <Card className={cn("w-[380px]")}>
      <CardHeader>
        <CardTitle>Painel de Conectividade</CardTitle>
        <CardDescription>
          ID: {deviceId || "Nenhum dispositivo informado"}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        {/* Resultado Final */}
        {testConn ? (
          <ConnectionState
            deviceId={deviceId}
            setDeviceStatus={setDeviceStatus}
            ref={connectionStateRef}
          ></ConnectionState>
        ) : (
          <div className="flex flex-col items-center space-y-2">
            <Wifi className="text-gray-300 w-8 h-8" />
            <p className="text-gray-300 font-medium">Aguardando</p>
          </div>
        )}
      </CardContent>

      <CardFooter>
        {/* O botão desaparece se a conexão for bem-sucedida */}
        {deviceStatus !== "Conectado" && (
          <Button className="w-full" onClick={() => handleCheckStatus()}>
            {deviceStatus === "Aguardando..."
              ? "Confirmar conexão"
              : deviceStatus === "Desconectado"
                ? "Tentar Novamente"
                : "Conectando..."}
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}

import { Wifi, WifiOff } from "lucide-react";

export const WifiIcon = ({ level, className = "" }) => {
  switch (level) {
    case 0:
      return <WifiZero className={`${className} text-blue-500`} />;
    case 1:
      return <WifiLow className={`${className} text-blue-500`} />;
    case 2:
      return <WifiHigh className={`${className} text-blue-500`} />;
    case 3:
      return <Wifi className={`${className} text-blue-500`} />;
    default:
      return <WifiLow className={`${className} text-blue-500`} />;
  }
};

const ConnectionState = forwardRef(({ deviceId, setDeviceStatus }, ref) => {
  const { gpsStatus, handleCheckGpsStatus } = useGpsStatus(deviceId, true);
  const [wifiLevel, setWifiLevel] = useState(0);
  useImperativeHandle(ref, () => handleCheckGpsStatus);
  useEffect(() => {
    setDeviceStatus(gpsStatus);
  }, [gpsStatus]);

  // Efeito para animação do WiFi quando aguardando
  useEffect(() => {
    let interval;
    if (gpsStatus === "Aguardando...") {
      interval = setInterval(() => {
        setWifiLevel((prev) => (prev + 1) % 4); // Alterna entre 0,1,2,3
      }, 100);
    }
    return () => clearInterval(interval);
  }, [gpsStatus]);

  // Renderiza o ícone de WiFi com base no nível

  return (
    <div className="flex flex-col items-center space-y-4">
      {gpsStatus === "Conectado" ? (
        <div className="flex flex-col items-center space-y-2">
          <Wifi className="w-8 h-8 text-green-500" />
          <p className="text-green-600 font-medium">Dispositivo conectado</p>
        </div>
      ) : gpsStatus === "Aguardando..." ? (
        <div className="flex flex-col items-center space-y-2">
          <WifiIcon level={wifiLevel} className={"w-8 h-8"} />
          <p className="text-blue-500 font-medium">Tentando conectar...</p>
        </div>
      ) : (
        <div className="flex flex-col items-center space-y-2">
          <WifiOff className="w-8 h-8 text-red-500" />
          <p className="text-red-600 font-medium">Dispositivo não conectado</p>
        </div>
      )}
    </div>
  );
});

ConnectionState.displayName = "ConnectionState";

export { ConnectionState };
