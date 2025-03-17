import { useEffect } from "react";
import { Loader2, Check, CheckCircle, X, Send, RefreshCw } from "lucide-react";
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
  const { gpsStatus, handleCheckGpsStatus } = useGpsStatus(deviceId,true);

  useEffect(() => {
    if (gpsStatus == "Conectado") {
      onConnectionResult(true);
    }else{
      onConnectionResult(false);
    }
    
  }, [gpsStatus]);

  return (
    <Card className={cn("w-[380px]")}>
      <CardHeader>
        <CardTitle>{gpsStatus}</CardTitle>
        <CardDescription>
          ID: {deviceId || "Nenhum dispositivo informado"}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        {/* Resultado Final */}
        {gpsStatus=== "Conectado" ? (
          <div className="flex flex-col items-center space-y-3">
            <CheckCircle className="text-green-500" size={75} />
            <p className="text-green-600 font-medium">
              Dispositivo conectado com sucesso!
            </p>
          </div>
        ) : (
          <div className="">
            {/* Passo 1: Verificação de Propriedade */}

            {/* Passo 2: Envio de Comunicação */}
            <div className="flex items-center space-x-3">
              {gpsStatus === "Enviando" ? (
                <Loader2 className="animate-spin text-blue-500" size={20} />
              ) : gpsStatus === "Recebido" ||
                gpsStatus === "Não recebido" ||
                gpsStatus === "Conectado" ||
                gpsStatus === "Enviado" ? (
                <Check className="text-green-500" size={20} />
              ) : (
                <Send className="text-gray-400" size={20} />
              )}
              <p
                className={
                  gpsStatus === "Enviando" ? "text-blue-500" : "text-gray-500"
                }
              >
                Conexão com servidor
              </p>
            </div>

            {/* Passo 3: Aguardando Resposta */}
            <div className="flex items-center space-x-3">
              {gpsStatus === "Recebido" || gpsStatus === "Enviado" ? (
                <Loader2 className="animate-spin text-blue-500" size={20} />
              ) : gpsStatus === "Conectado" ? (
                <Check className="text-green-500" size={20} />
              ) : gpsStatus === "Não recebido" ? (
                <X className="text-red-500" size={20} />
              ) : (
                <RefreshCw className="text-gray-400" size={20} />
              )}
              <p
                className={
                  gpsStatus === "Recebido" ? "text-blue-500" : "text-gray-500"
                }
              >
                Resposta do dispositivo
              </p>
            </div>
          </div>
        )}
      </CardContent>

      <CardFooter>
        {/* O botão desaparece se a conexão for bem-sucedida */}
        {gpsStatus !== "Conectado" && (
          <Button className="w-full" onClick={() => handleCheckGpsStatus()}>
            {gpsStatus === "Aguardando..."
              ? "Conectar"
              : gpsStatus === "Desconectado"
                ? "Tentar Novamente"
                : "Conectando..."}
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}
