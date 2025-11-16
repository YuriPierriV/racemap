import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Satellite,
  MapPin,
  Gauge,
  Signal,
  SignalHigh,
  SignalLow,
  SignalMedium,
} from "lucide-react";

/**
 * Componente para exibir qualidade de conexão
 */
const ConnectionQualityIndicator = ({ quality }) => {
  const configs = {
    excellent: {
      icon: Signal,
      color: "text-green-500",
      bg: "bg-green-50 dark:bg-green-950",
      text: "Excelente",
    },
    good: {
      icon: SignalHigh,
      color: "text-blue-500",
      bg: "bg-blue-50 dark:bg-blue-950",
      text: "Boa",
    },
    poor: {
      icon: SignalMedium,
      color: "text-yellow-500",
      bg: "bg-yellow-50 dark:bg-yellow-950",
      text: "Fraca",
    },
    lost: {
      icon: SignalLow,
      color: "text-red-500",
      bg: "bg-red-50 dark:bg-red-950",
      text: "Perdida",
    },
    unknown: {
      icon: Signal,
      color: "text-gray-500",
      bg: "bg-gray-50 dark:bg-gray-950",
      text: "Desconhecida",
    },
  };

  const config = configs[quality] || configs.unknown;
  const Icon = config.icon;

  return (
    <div
      className={`inline-flex items-center gap-2 px-3 py-1 rounded-full ${config.bg}`}
    >
      <Icon className={`w-4 h-4 ${config.color}`} />
      <span className={`text-sm font-medium ${config.color}`}>
        {config.text}
      </span>
    </div>
  );
};

/**
 * Componente de monitoramento GPS em tempo real
 */
export default function GpsMonitor({ gpsData, connectionQuality, trackStats }) {
  const {
    gpsConnected,
    satellites,
    lat,
    long,
    speedKmph,
    date,
    time,
    lastUpdate,
  } = gpsData;

  const timeSinceUpdate = lastUpdate
    ? Math.floor((Date.now() - lastUpdate) / 1000)
    : null;

  return (
    <div className="space-y-4">
      {/* Status Principal */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">Status GPS</CardTitle>
            <ConnectionQualityIndicator quality={connectionQuality} />
          </div>
          <CardDescription>
            {timeSinceUpdate !== null && (
              <span>Última atualização há {timeSinceUpdate}s</span>
            )}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            {/* Status de Conexão */}
            <div className="flex items-center gap-2">
              <Badge variant={gpsConnected ? "default" : "destructive"}>
                {gpsConnected ? "Conectado" : "Desconectado"}
              </Badge>
            </div>

            {/* Satélites */}
            <div className="flex items-center gap-2">
              <Satellite className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm">
                <strong>{satellites}</strong> satélites
              </span>
            </div>

            {/* Posição */}
            <div className="col-span-2 flex items-start gap-2">
              <MapPin className="w-4 h-4 text-muted-foreground mt-0.5" />
              <div className="text-sm">
                <div className="font-mono">
                  <strong>Lat:</strong> {lat.toFixed(6)}
                </div>
                <div className="font-mono">
                  <strong>long:</strong> {long.toFixed(6)}
                </div>
              </div>
            </div>

            {/* Velocidade */}
            <div className="flex items-center gap-2">
              <Gauge className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm">
                <strong>{speedKmph.toFixed(1)}</strong> km/h
              </span>
            </div>

            {/* Data/Hora */}
            <div className="text-sm">
              <div>{date}</div>
              <div className="font-mono">{time}</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Estatísticas de Rastreamento */}
      {trackStats && trackStats.totalPoints > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">
              Estatísticas de Rastreamento
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">
                  Pontos capturados:
                </span>
                <div className="text-lg font-bold">
                  {trackStats.totalPoints}
                </div>
              </div>
              <div>
                <span className="text-muted-foreground">Distância:</span>
                <div className="text-lg font-bold">
                  {(trackStats.distance / 1000).toFixed(2)} km
                </div>
              </div>
              <div>
                <span className="text-muted-foreground">
                  Velocidade máxima:
                </span>
                <div className="text-lg font-bold">
                  {trackStats.maxSpeed.toFixed(1)} km/h
                </div>
              </div>
              <div>
                <span className="text-muted-foreground">Velocidade média:</span>
                <div className="text-lg font-bold">
                  {trackStats.avgSpeed.toFixed(1)} km/h
                </div>
              </div>
              <div className="col-span-2">
                <span className="text-muted-foreground">Duração:</span>
                <div className="text-lg font-bold">
                  {Math.floor(trackStats.duration / 60)}m{" "}
                  {Math.floor(trackStats.duration % 60)}s
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
