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
  const { comm, checkGpsStatus } = useGpsStatus(deviceId);

  useEffect(() => {
    if (comm === "Conectado") {
      onConnectionResult(true);
    }
  }, [comm]);

  return (
    <Card className={cn("w-[380px]")}>
      <CardHeader>
        <CardTitle>Conexão com Dispositivo</CardTitle>
        <CardDescription>
          ID: {deviceId || "Nenhum dispositivo informado"}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        {/* Resultado Final */}
        {comm === "Conectado" ? (
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
              {comm === "Enviando" ? (
                <Loader2 className="animate-spin text-blue-500" size={20} />
              ) : comm === "Recebido" ||
                comm === "Não recebido" ||
                comm === "Conectado" ||
                comm === "Enviado" ? (
                <Check className="text-green-500" size={20} />
              ) : (
                <Send className="text-gray-400" size={20} />
              )}
              <p
                className={
                  comm === "Enviando" ? "text-blue-500" : "text-gray-500"
                }
              >
                Conexão com servidor
              </p>
            </div>

            {/* Passo 3: Aguardando Resposta */}
            <div className="flex items-center space-x-3">
              {comm === "Recebido" || comm === "Enviado" ? (
                <Loader2 className="animate-spin text-blue-500" size={20} />
              ) : comm === "Conectado" ? (
                <Check className="text-green-500" size={20} />
              ) : comm === "Não recebido" ? (
                <X className="text-red-500" size={20} />
              ) : (
                <RefreshCw className="text-gray-400" size={20} />
              )}
              <p
                className={
                  comm === "Recebido" ? "text-blue-500" : "text-gray-500"
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
        {comm !== "Conectado" && (
          <Button className="w-full" onClick={() => checkGpsStatus()}>
            {comm === "Não Iniciada"
              ? "Conectar"
              : comm === "Não recebido"
                ? "Tentar Novamente"
                : "Conectando..."}
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}
