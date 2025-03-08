import { useState, useEffect } from "react";
import { Loader2, Check, X, ShieldCheck, Send, RefreshCw } from "lucide-react";
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
    const [status, setStatus] = useState("idle"); // idle, verifying, sending, waiting, success, failed
    const { gpsStatus, lastCheckTime, mode, isConnected, checkGpsStatus } = useGpsStatus(deviceId);

    useEffect(() => {
        if (status === "verifying") {
            // Iniciar verificação real via MQTT
            checkGpsStatus();
            setTimeout(() => setStatus("sending"), 2000);
        } else if (status === "sending") {
            // Enviar comunicação real
            setTimeout(() => setStatus("waiting"), 2000);
        } else if (status === "waiting") {
            // Aguardar resposta do GPS real
            if (gpsStatus === "Conectado") {
                setStatus("success");
                onConnectionResult(true); // Passa sucesso para o formulário
            } else {
                setStatus("failed");
                onConnectionResult(false); // Passa falha para o formulário
            }
        }
    }, [status, gpsStatus]);

    return (
        <Card className={cn("w-[380px]")}>
            <CardHeader>
                <CardTitle>Conexão com Dispositivo</CardTitle>
                <CardDescription>ID: {deviceId || "Nenhum dispositivo informado"}</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
                {/* Passo 1: Verificação de Propriedade */}
                <div className="flex items-center space-x-3">
                    {status === "verifying" ? (
                        <Loader2 className="animate-spin text-blue-500" size={20} />
                    ) : status !== "idle" ? (
                        <Check className="text-green-500" size={20} />
                    ) : (
                        <ShieldCheck className="text-gray-400" size={20} />
                    )}
                    <p className={status === "verifying" ? "text-blue-500" : "text-gray-500"}>
                        Verificando propriedade...
                    </p>
                </div>

                {/* Passo 2: Envio de Comunicação */}
                <div className="flex items-center space-x-3">
                    {status === "sending" ? (
                        <Loader2 className="animate-spin text-blue-500" size={20} />
                    ) : status === "waiting" || status === "success" || status === "failed" ? (
                        <Check className="text-green-500" size={20} />
                    ) : (
                        <Send className="text-gray-400" size={20} />
                    )}
                    <p className={status === "sending" ? "text-blue-500" : "text-gray-500"}>
                        Enviando comunicação para o dispositivo...
                    </p>
                </div>

                {/* Passo 3: Aguardando Resposta */}
                <div className="flex items-center space-x-3">
                    {status === "waiting" ? (
                        <Loader2 className="animate-spin text-blue-500" size={20} />
                    ) : status === "success" || status === "failed" ? (
                        <Check className="text-green-500" size={20} />
                    ) : (
                        <RefreshCw className="text-gray-400" size={20} />
                    )}
                    <p className={status === "waiting" ? "text-blue-500" : "text-gray-500"}>
                        Aguardando resposta do dispositivo...
                    </p>
                </div>

                {/* Resultado Final */}
                {status === "success" && (
                    <div className="flex items-center space-x-3">
                        <Check className="text-green-500" size={24} />
                        <p className="text-green-600 font-medium">Dispositivo conectado com sucesso!</p>
                    </div>
                )}
                {status === "failed" && (
                    <div className="flex items-center space-x-3">
                        <X className="text-red-500" size={24} />
                        <p className="text-red-600 font-medium">Falha na conexão. Tente novamente.</p>
                    </div>
                )}
            </CardContent>

            <CardFooter>
                {/* O botão desaparece se a conexão for bem-sucedida */}
                {status !== "success" && (
                    <Button
                        className="w-full"
                        onClick={() => setStatus("verifying")}
                        disabled={!deviceId || (status !== "idle" && status !== "failed")}
                    >
                        {status === "idle" || status === "failed" ? "Tentar Conectar" : "Conectando..."}
                    </Button>
                )}
            </CardFooter>

        </Card>
    );
}
