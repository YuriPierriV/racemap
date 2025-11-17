import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Play,
  Pause,
  StopCircle,
  RotateCcw,
  Radio,
  Wifi,
  WifiOff,
  Navigation,
  MapPin,
  Activity,
  Gauge,
  Target,
  Loader2,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import useGpsData from "pages/mqtt/useGpsData";
import MapPreviewClean from "./MapPreviewClean";

export default function TrackRecording({
  selectedDevice,
  startLat,
  startLong,
  points,
  trackingStatus,
  onUpdatePoints,
  onUpdateTrackingStatus,
  onUpdateStartPosition,
  onNext,
}) {
  // Circuito sempre fechado (closed)
  const circuitType = "closed";
  const [trackBuffer, setTrackBuffer] = useState([]);
  const [totalDistance, setTotalDistance] = useState(0);
  const [lastGpsStatus, setLastGpsStatus] = useState(null);
  const [nearStartPoint, setNearStartPoint] = useState(false);
  const BUFFER_SIZE = 5; // Captura média de 5 pontos GPS
  const PROXIMITY_THRESHOLD = 15; // Distância em metros para considerar próximo ao ponto inicial

  // Hook de dados GPS em tempo real
  const gpsHook = useGpsData(selectedDevice?.chip_id, {
    enableTracking: false,
  });

  const {
    gpsData,
    connectionQuality,
    isGpsConnected: gpsConnected,
    isReceivingData,
  } = gpsHook || {};
  const {
    lat,
    long,
    satellites,
    speedKmph,
    gpsConnected: gpsConnectedFromData,
  } = gpsData || {};

  // Considera GPS conectado se está recebendo dados E tem coordenadas válidas
  const isGpsConnected =
    (gpsConnected || gpsConnectedFromData) && isReceivingData && lat && long;

  console.log("GPS Status:", {
    isGpsConnected,
    gpsConnected,
    gpsConnectedFromData,
    isReceivingData,
    lat,
    long,
    satellites,
    speedKmph,
    connectionQuality,
    chipId: selectedDevice?.chip_id,
  });

  // Monitorar mudanças no status do GPS
  useEffect(() => {
    if (lastGpsStatus !== null && lastGpsStatus !== isGpsConnected) {
      if (!isGpsConnected && trackingStatus === "tracking") {
        console.log(
          "⚠️ GPS desconectado durante rastreamento! Pausando automaticamente...",
        );
        onUpdateTrackingStatus("paused");
      } else if (isGpsConnected && lastGpsStatus === false) {
        console.log("✅ GPS reconectado!");
      }
    }
    setLastGpsStatus(isGpsConnected);
  }, [isGpsConnected, trackingStatus, lastGpsStatus, onUpdateTrackingStatus]);

  // Calcular distância entre dois pontos GPS (fórmula de Haversine)
  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371e3; // Raio da Terra em metros
    const φ1 = (lat1 * Math.PI) / 180;
    const φ2 = (lat2 * Math.PI) / 180;
    const Δφ = ((lat2 - lat1) * Math.PI) / 180;
    const Δλ = ((lon2 - lon1) * Math.PI) / 180;

    const a =
      Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
      Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c; // Retorna distância em metros
  };

  // Adicionar pontos ao buffer quando rastreamento está ativo
  useEffect(() => {
    if (trackingStatus === "tracking" && isGpsConnected) {
      const newPoint = { lat: parseFloat(lat), lng: parseFloat(long) };

      // Adiciona ao buffer
      const updatedBuffer = [...trackBuffer, newPoint];
      setTrackBuffer(updatedBuffer);

      // Quando buffer atinge tamanho desejado, calcula média e verifica distância
      if (updatedBuffer.length >= BUFFER_SIZE) {
        // Calcular média das coordenadas do buffer
        const avgLat =
          updatedBuffer.reduce((sum, p) => sum + p.lat, 0) /
          updatedBuffer.length;
        const avgLng =
          updatedBuffer.reduce((sum, p) => sum + p.lng, 0) /
          updatedBuffer.length;

        let shouldAddPoint = false;
        let distanceFromLast = 0;

        // Se é o primeiro ponto, adiciona sempre
        if (points.length === 0) {
          shouldAddPoint = true;
        } else {
          // Calcula distância da média do buffer em relação ao último ponto adicionado
          const lastPoint = points[points.length - 1];
          distanceFromLast = calculateDistance(
            lastPoint[0],
            lastPoint[1],
            avgLat,
            avgLng,
          );

          // Adiciona apenas se a distância for maior que 5 metros
          if (distanceFromLast >= 5) {
            shouldAddPoint = true;
          }
        }

        if (shouldAddPoint) {
          const averagedPoint = [avgLat, avgLng];
          const newPoints = [...points, averagedPoint];
          onUpdatePoints(newPoints);

          // Adicionar à distância total apenas quando adicionar ponto
          if (points.length > 0) {
            setTotalDistance((prev) => prev + distanceFromLast);
          }

          console.log(
            `✅ Ponto adicionado! Distância do anterior: ${distanceFromLast.toFixed(2)}m | Total de pontos: ${newPoints.length}`,
          );

          // Verificar proximidade ao ponto inicial (apenas para circuitos fechados e após 3 pontos)
          if (circuitType === "closed" && newPoints.length >= 3) {
            const distanceToStart = calculateDistance(
              avgLat,
              avgLng,
              startLat,
              startLong,
            );
            console.log(
              `📍 Distância ao ponto inicial: ${distanceToStart.toFixed(2)}m`,
            );

            if (distanceToStart <= PROXIMITY_THRESHOLD) {
              console.log(
                `🏁 Circuito fechado detectado! Pausando automaticamente...`,
              );
              setNearStartPoint(true);
              onUpdateTrackingStatus("paused");
            } else {
              setNearStartPoint(false);
            }
          }
        } else {
          console.log(
            `❌ Ponto descartado! Distância muito pequena: ${distanceFromLast.toFixed(2)}m (mínimo: 5m)`,
          );
        }

        // Limpar buffer após processar
        setTrackBuffer([]);
      }
    }
  }, [
    lat,
    long,
    trackingStatus,
    isGpsConnected,
    circuitType,
    onUpdatePoints,
    onUpdateTrackingStatus,
    points,
    startLat,
    startLong,
    trackBuffer,
  ]);

  const handleStartTracking = () => {
    // Capturar posição inicial automaticamente
    if (!startLat && !startLong && lat && long) {
      onUpdateStartPosition(lat, long);
      console.log(
        `📍 Ponto inicial capturado automaticamente: [${lat}, ${long}]`,
      );
    }
    onUpdateTrackingStatus("tracking");
  };

  const handlePauseTracking = () => {
    onUpdateTrackingStatus("paused");
  };

  const handleStopTracking = () => {
    onUpdateTrackingStatus("completed");
  };

  const handleRestart = () => {
    setTrackBuffer([]);
    setTotalDistance(0);
    onUpdatePoints([]);
    onUpdateTrackingStatus("ready");
  };

  const handleFinish = () => {
    if (points.length > 0) {
      onUpdateTrackingStatus("completed");
      onNext();
    }
  };

  const getConnectionQualityColor = (quality) => {
    switch (quality) {
      case "excellent":
        return "text-green-600 dark:text-green-400";
      case "good":
        return "text-blue-600 dark:text-blue-400";
      case "fair":
        return "text-yellow-600 dark:text-yellow-400";
      case "poor":
        return "text-orange-600 dark:text-orange-400";
      default:
        return "text-red-600 dark:text-red-400";
    }
  };

  const getConnectionQualityLabel = (quality) => {
    switch (quality) {
      case "excellent":
        return "Excelente";
      case "good":
        return "Boa";
      case "fair":
        return "Razoável";
      case "poor":
        return "Fraca";
      default:
        return "Sem Sinal";
    }
  };

  return (
    <div className="flex flex-col lg:flex-row gap-6">
      {/* Mapa - Lado Esquerdo */}
      <div className="w-full lg:w-[450px]">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Visualização do Traçado</CardTitle>
          </CardHeader>
          <CardContent>
            {points.length > 0 ? (
              <MapPreviewClean
                points={points}
                direction="clockwise"
                className="h-[400px] w-full"
              />
            ) : startLat && startLong ? (
              <MapPreviewClean
                points={[[parseFloat(startLat), parseFloat(startLong)]]}
                direction="clockwise"
                className="h-[400px] w-full"
                showStartOnly={true}
              />
            ) : isGpsConnected && lat && long ? (
              <MapPreviewClean
                points={[[parseFloat(lat), parseFloat(long)]]}
                direction="clockwise"
                className="h-[400px] w-full"
                showStartOnly={true}
              />
            ) : (
              <div className="h-[400px] w-full rounded-lg border-2 border-dashed border-muted flex items-center justify-center bg-muted/10">
                <div className="text-center text-muted-foreground">
                  <MapPin className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p className="text-sm font-medium">Aguardando GPS...</p>
                  <p className="text-xs mt-1">
                    Conecte o GPS para visualizar sua posição
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Painel Lateral - Lado Direito */}
      <div className="flex-1 space-y-4">
        {/* Notificação de Circuito Fechado */}
        {nearStartPoint && circuitType === "closed" && (
          <Card className="bg-green-50 dark:bg-green-950 border-green-500 border-2">
            <CardContent className="pt-4 pb-4">
              <div className="flex items-center gap-3">
                <CheckCircle2 className="w-6 h-6 text-green-600 dark:text-green-400 flex-shrink-0" />
                <div>
                  <p className="font-semibold text-green-800 dark:text-green-200">
                    🏁 Circuito Fechado Detectado!
                  </p>
                  <p className="text-sm text-green-700 dark:text-green-300 mt-1">
                    Você retornou ao ponto inicial. O rastreamento foi pausado
                    automaticamente.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Pré-visualização da Posição Inicial */}
        {trackingStatus === "ready" &&
          isGpsConnected &&
          !startLat &&
          !startLong && (
            <Card className="bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800">
              <CardContent className="pt-4 pb-4">
                <div className="flex items-center gap-3">
                  <MapPin className="w-6 h-6 text-blue-600 dark:text-blue-400 flex-shrink-0" />
                  <div>
                    <p className="font-semibold text-blue-800 dark:text-blue-200">
                      📍 Posição Atual Visualizada
                    </p>
                    <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
                      Esta será sua posição inicial. Clique em &quot;Iniciar
                      Rastreamento&quot; quando estiver pronto.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

        {/* Botão de Controle Principal - No Topo */}
        <Card>
          <CardContent className="pt-6 pb-6">
            {trackingStatus === "ready" && (
              <Button
                onClick={handleStartTracking}
                disabled={!isGpsConnected}
                className="w-full h-14 text-lg font-semibold"
                size="lg"
              >
                <Play className="w-6 h-6 mr-2" />
                Iniciar Rastreamento
              </Button>
            )}

            {trackingStatus === "tracking" && (
              <div className="grid grid-cols-2 gap-3">
                <Button
                  onClick={handlePauseTracking}
                  variant="secondary"
                  className="h-14 text-base"
                  size="lg"
                >
                  <Pause className="w-5 h-5 mr-2" />
                  Pausar
                </Button>
                <Button
                  onClick={handleStopTracking}
                  variant="destructive"
                  className="h-14 text-base"
                  size="lg"
                >
                  <StopCircle className="w-5 h-5 mr-2" />
                  Parar
                </Button>
              </div>
            )}

            {trackingStatus === "paused" && (
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <Button
                    onClick={handleStartTracking}
                    className="h-14 text-base"
                    size="lg"
                  >
                    <Play className="w-5 h-5 mr-2" />
                    Retomar
                  </Button>
                  <Button
                    onClick={handleStopTracking}
                    variant="destructive"
                    className="h-14 text-base"
                    size="lg"
                  >
                    <StopCircle className="w-5 h-5 mr-2" />
                    Parar
                  </Button>
                </div>
                <Button
                  onClick={handleRestart}
                  variant="outline"
                  className="w-full h-12"
                >
                  <RotateCcw className="w-4 h-4 mr-2" />
                  Recomeçar
                </Button>
              </div>
            )}

            {trackingStatus === "completed" && (
              <div className="space-y-3">
                <Button
                  onClick={handleFinish}
                  className="w-full h-14 text-lg font-semibold bg-green-600 hover:bg-green-700"
                  size="lg"
                >
                  <CheckCircle2 className="w-6 h-6 mr-2" />
                  Concluir e Avançar
                </Button>
                <Button
                  onClick={handleRestart}
                  variant="outline"
                  className="w-full h-12"
                >
                  <RotateCcw className="w-4 h-4 mr-2" />
                  Recomeçar
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Grid 2x2 de Cards de Informações */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Card 1: Status do Dispositivo */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <Radio className="w-4 h-4" />
                Dispositivo
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <span className="text-xs text-muted-foreground">Nome:</span>
                <p className="text-sm font-medium mt-1">
                  {selectedDevice?.name || "N/A"}
                </p>
              </div>

              <Separator />

              <div>
                <span className="text-xs text-muted-foreground">Chip ID:</span>
                <p className="text-xs font-mono font-medium mt-1">
                  {selectedDevice?.chip_id || "N/A"}
                </p>
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">GPS:</span>
                <div className="flex items-center gap-2">
                  {isGpsConnected ? (
                    <>
                      <Wifi className="w-4 h-4 text-green-600 dark:text-green-400 animate-pulse" />
                      <span className="text-xs font-medium text-green-600 dark:text-green-400">
                        Conectado
                      </span>
                    </>
                  ) : (
                    <>
                      <WifiOff className="w-4 h-4 text-red-600 dark:text-red-400 animate-pulse" />
                      <span className="text-xs font-medium text-red-600 dark:text-red-400">
                        Desconectado
                      </span>
                    </>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Card 2: Qualidade do Sinal */}
          <Card
            className={
              !isGpsConnected ? "border-red-200 dark:border-red-800" : ""
            }
          >
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <Activity
                  className={`w-4 h-4 ${!isGpsConnected ? "animate-pulse" : ""}`}
                />
                Sinal GPS
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">
                  Qualidade:
                </span>
                <div className="flex items-center gap-2">
                  {!isGpsConnected && (
                    <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                  )}
                  <span
                    className={`text-xs font-medium ${getConnectionQualityColor(connectionQuality)}`}
                  >
                    {getConnectionQualityLabel(connectionQuality)}
                  </span>
                </div>
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">
                  Satélites:
                </span>
                <Badge
                  variant="secondary"
                  className={`text-sm ${!isGpsConnected ? "opacity-50" : ""}`}
                >
                  {satellites || 0}
                </Badge>
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">
                  Velocidade:
                </span>
                <span
                  className={`text-xs font-medium ${!isGpsConnected ? "opacity-50" : ""}`}
                >
                  {speedKmph ? `${speedKmph} km/h` : "0 km/h"}
                </span>
              </div>

              {!isGpsConnected && (
                <>
                  <Separator />
                  <div className="flex items-center gap-2 text-red-600 dark:text-red-400">
                    <AlertCircle className="w-3 h-3 animate-pulse" />
                    <span className="text-xs font-medium">Sem dados GPS</span>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Card 3: Dados GPS */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <Navigation className="w-4 h-4" />
                Coordenadas
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {isGpsConnected ? (
                <>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <Target className="w-3 h-3 text-muted-foreground" />
                      <span className="text-xs text-muted-foreground">
                        Latitude
                      </span>
                    </div>
                    <p className="text-xs font-mono font-medium">
                      {lat || "-"}
                    </p>
                  </div>

                  <Separator />

                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <Target className="w-3 h-3 text-muted-foreground" />
                      <span className="text-xs text-muted-foreground">
                        Longitude
                      </span>
                    </div>
                    <p className="text-xs font-mono font-medium">
                      {long || "-"}
                    </p>
                  </div>
                </>
              ) : (
                <div className="text-center py-6 text-muted-foreground text-xs">
                  <WifiOff className="w-6 h-6 mx-auto mb-2 opacity-50" />
                  <p>Aguardando GPS...</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Card 4: Estatísticas do Rastreamento */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <Gauge className="w-4 h-4" />
                Estatísticas
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">Pontos:</span>
                <Badge variant="secondary" className="text-base font-bold px-3">
                  {points.length}
                </Badge>
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">
                  Distância:
                </span>
                <span className="text-xs font-medium">
                  {totalDistance > 0
                    ? `${(totalDistance / 1000).toFixed(3)} km`
                    : "0.000 km"}
                </span>
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">Buffer:</span>
                <div className="flex items-center gap-1">
                  <div className="flex gap-0.5">
                    {[...Array(BUFFER_SIZE)].map((_, i) => (
                      <div
                        key={i}
                        className={`w-2 h-2 rounded-full ${
                          i < trackBuffer.length ? "bg-blue-500" : "bg-muted"
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-xs font-medium ml-1">
                    {trackBuffer.length}/{BUFFER_SIZE}
                  </span>
                </div>
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">Status:</span>
                {trackingStatus === "tracking" && (
                  <Badge className="bg-green-600 text-white text-xs">
                    <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                    Rastreando
                  </Badge>
                )}
                {trackingStatus === "paused" && (
                  <Badge variant="secondary" className="text-xs">
                    <Pause className="w-3 h-3 mr-1" />
                    Pausado
                  </Badge>
                )}
                {trackingStatus === "ready" && (
                  <Badge variant="outline" className="text-xs">
                    Pronto
                  </Badge>
                )}
                {trackingStatus === "completed" && (
                  <Badge className="bg-blue-600 text-white text-xs">
                    <CheckCircle2 className="w-3 h-3 mr-1" />
                    Concluído
                  </Badge>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Card Informativo */}
        {!isGpsConnected &&
          trackingStatus === "paused" &&
          points.length > 0 && (
            <Card className="bg-red-50 dark:bg-red-950 border-red-200 dark:border-red-800 animate-pulse">
              <CardContent className="pt-4 pb-4 px-4">
                <div className="flex items-start gap-3">
                  <WifiOff className="w-5 h-5 text-red-600 dark:text-red-400 mt-0.5 flex-shrink-0" />
                  <div className="text-sm text-red-800 dark:text-red-200">
                    <p className="font-semibold mb-1">⚠️ GPS Desconectado!</p>
                    <p className="text-xs">
                      O rastreamento foi pausado automaticamente. Reconecte o
                      GPS para continuar.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

        {!isGpsConnected && trackingStatus === "ready" && (
          <Card className="bg-yellow-50 dark:bg-yellow-950 border-yellow-200 dark:border-yellow-800">
            <CardContent className="pt-4 pb-4 px-4">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-yellow-600 dark:text-yellow-400 mt-0.5 flex-shrink-0" />
                <div className="text-sm text-yellow-800 dark:text-yellow-200">
                  <p className="font-semibold mb-1">GPS Desconectado</p>
                  <p className="text-xs">
                    Verifique se o dispositivo está ligado e possui sinal GPS
                    adequado antes de iniciar.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {trackingStatus === "ready" && isGpsConnected && (
          <Card className="bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800">
            <CardContent className="pt-4 pb-4 px-4">
              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                <div className="text-sm text-blue-800 dark:text-blue-200">
                  <p className="font-semibold mb-2">
                    Sistema de Rastreamento Inteligente
                  </p>
                  <ul className="text-xs space-y-1.5 list-disc list-inside">
                    <li>Captura automática de posição GPS em tempo real</li>
                    <li>
                      Cada {BUFFER_SIZE} leituras são calculadas em média para
                      precisão
                    </li>
                    <li>
                      Pontos adicionados apenas se distância ≥ 5 metros do
                      anterior
                    </li>
                    <li>Traçado otimizado e suave sem ruído GPS</li>
                    <li>Percorra o circuito em velocidade constante</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {trackingStatus === "tracking" && (
          <Card className="bg-green-50 dark:bg-green-950 border-green-200 dark:border-green-800">
            <CardContent className="pt-4 pb-4 px-4">
              <div className="flex items-start gap-3">
                <Activity className="w-5 h-5 text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0 animate-pulse" />
                <div className="text-sm text-green-800 dark:text-green-200">
                  <p className="font-semibold mb-2">Rastreamento Ativo</p>
                  <ul className="text-xs space-y-1.5 list-disc list-inside">
                    <li>
                      🏁 <strong>Bandeira</strong>: Ponto inicial do circuito
                    </li>
                    <li>
                      � <strong>Cursor</strong>: Sua posição atual no traçado
                    </li>
                    <li>
                      � <strong>Linha azul</strong>: Traçado já capturado
                    </li>
                    <li>Aguarde percorrer 5m para adicionar novo ponto</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
