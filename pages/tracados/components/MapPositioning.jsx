import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
  Loader2,
  MapPin,
  Satellite,
  Wifi,
  WifiOff,
  Radio,
  Navigation,
  Target,
  Activity,
} from "lucide-react";
import dynamic from "next/dynamic";
import useGpsData from "pages/mqtt/useGpsData";

// Importação dinâmica do Leaflet para evitar erros de SSR
const MapContainer = dynamic(
  () => import("react-leaflet").then((mod) => mod.MapContainer),
  { ssr: false },
);
const TileLayer = dynamic(
  () => import("react-leaflet").then((mod) => mod.TileLayer),
  { ssr: false },
);
const Circle = dynamic(
  () => import("react-leaflet").then((mod) => mod.Circle),
  { ssr: false },
);
const RecenterMap = dynamic(() => import("./RecenterMap"), { ssr: false });

export default function MapPositioning({
  selectedDevice,
  onUpdatePosition,
  onNext,
}) {
  const [mapView, setMapView] = useState("satellite");

  const { gpsData, connectionQuality, hasValidPosition, isGpsConnected } =
    useGpsData(selectedDevice?.chip_id, {
      enableTracking: false,
    });

  const currentLat = gpsData?.lat ?? 0;
  const currentLong = gpsData?.long ?? 0;
  const satellites = gpsData?.satellites ?? 0;
  const speed = gpsData?.speedKmph ?? 0;
  const hasPosition = hasValidPosition && currentLat && currentLong;

  const mapCenter = hasPosition ? [currentLat, currentLong] : [-15.78, -47.93]; // Brasília

  const getQualityBar = () => {
    const colors = {
      excellent: "bg-green-500",
      good: "bg-blue-500",
      poor: "bg-yellow-500",
      lost: "bg-red-500",
    };
    return colors[connectionQuality] || "bg-gray-400";
  };

  const handleUsePosition = () => {
    if (hasPosition) {
      onUpdatePosition(currentLat, currentLong);
      // Avança para o próximo passo após salvar a posição
      if (onNext) {
        setTimeout(() => onNext(), 300);
      }
    }
  };

  return (
    <div className="flex flex-col lg:flex-row gap-6 h-full">
      {/* Mapa - Menor proporção */}
      <div className="relative w-full lg:w-[500px] h-[350px] lg:h-[450px] rounded-lg overflow-hidden border-2 shadow-md bg-muted flex-shrink-0">
        {typeof window === "undefined" ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
            <p className="text-sm text-muted-foreground">Carregando mapa...</p>
          </div>
        ) : (
          <MapContainer
            key="map-positioning-container"
            center={mapCenter}
            zoom={18}
            style={{ height: "100%", width: "100%" }}
            zoomControl={false}
            attributionControl={false}
            dragging={false}
            scrollWheelZoom={false}
            doubleClickZoom={false}
          >
            <TileLayer
              url={
                mapView === "satellite"
                  ? "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
                  : "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              }
            />

            {hasPosition && (
              <>
                <Circle
                  center={[currentLat, currentLong]}
                  radius={5}
                  pathOptions={{
                    color: isGpsConnected ? "#22c55e" : "#ef4444",
                    fillColor: isGpsConnected ? "#22c55e" : "#ef4444",
                    fillOpacity: 0.2,
                  }}
                />
                <RecenterMap center={[currentLat, currentLong]} />
              </>
            )}
          </MapContainer>
        )}

        {/* Botões de visualização */}
        <div className="absolute top-2 right-2 flex gap-1 z-[1000]">
          <Button
            size="icon"
            variant={mapView === "satellite" ? "default" : "secondary"}
            onClick={() => setMapView("satellite")}
            className="shadow-lg h-8 w-8"
          >
            <Satellite className="w-4 h-4" />
          </Button>
          <Button
            size="icon"
            variant={mapView === "street" ? "default" : "secondary"}
            onClick={() => setMapView("street")}
            className="shadow-lg h-8 w-8"
          >
            <MapPin className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Painel de Informações - Aumentado */}
      <div className="w-full lg:flex-1 space-y-4">
        {/* Status de Conexão */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Radio className="w-4 h-4" />
                Status do Dispositivo
              </div>
              <Badge
                variant={isGpsConnected ? "default" : "secondary"}
                className="text-xs"
              >
                {isGpsConnected ? (
                  <>
                    <Wifi className="w-3 h-3 mr-1" /> Conectado
                  </>
                ) : (
                  <>
                    <WifiOff className="w-3 h-3 mr-1" /> Desconectado
                  </>
                )}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {/* Nome do Dispositivo */}
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Dispositivo</span>
              <span className="font-medium">
                {selectedDevice?.chip_id || "N/A"}
              </span>
            </div>

            <Separator />

            {/* Qualidade de Sinal */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">
                  Qualidade do Sinal
                </span>
                <span className="font-medium capitalize">
                  {connectionQuality}
                </span>
              </div>
              <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                <div
                  className={`h-full ${getQualityBar()} transition-all duration-500`}
                  style={{
                    width:
                      connectionQuality === "excellent"
                        ? "100%"
                        : connectionQuality === "good"
                          ? "75%"
                          : connectionQuality === "poor"
                            ? "40%"
                            : "15%",
                  }}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Dados GPS */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Navigation className="w-4 h-4" />
              Dados de Posicionamento
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {hasPosition ? (
              <>
                {/* Coordenadas */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label className="text-xs text-muted-foreground">
                      Latitude
                    </Label>
                    <div className="font-mono text-sm font-medium">
                      {currentLat.toFixed(6)}°
                    </div>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs text-muted-foreground">
                      Longitude
                    </Label>
                    <div className="font-mono text-sm font-medium">
                      {currentLong.toFixed(6)}°
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Métricas */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="flex items-center gap-2 p-2 rounded-md bg-muted/50">
                    <Radio className="w-4 h-4 text-primary" />
                    <div>
                      <div className="text-xs text-muted-foreground">
                        Satélites
                      </div>
                      <div className="text-sm font-semibold">{satellites}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 p-2 rounded-md bg-muted/50">
                    <Activity className="w-4 h-4 text-primary" />
                    <div>
                      <div className="text-xs text-muted-foreground">
                        Velocidade
                      </div>
                      <div className="text-sm font-semibold">
                        {speed.toFixed(0)} km/h
                      </div>
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Botão de Ação - Avança para próximo passo */}
                <Button
                  onClick={handleUsePosition}
                  disabled={!isGpsConnected}
                  className="w-full h-11"
                >
                  <Target className="w-4 h-4 mr-2" />
                  Definir Ponto Inicial e Continuar
                </Button>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                <Loader2 className="w-8 h-8 animate-spin mb-3" />
                <span className="text-sm font-medium">
                  Aguardando sinal GPS
                </span>
                <span className="text-xs mt-1">
                  Verifique a conexão do dispositivo
                </span>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Card Informativo */}
        <Card className="bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800">
          <CardContent className="pt-4 pb-4 px-4">
            <div className="flex items-start gap-3">
              <MapPin className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
              <div className="text-sm text-blue-800 dark:text-blue-200">
                <p className="font-semibold mb-2">
                  Sobre o Posicionamento Inicial
                </p>
                <ul className="text-xs space-y-1.5 list-disc list-inside">
                  <li>Este ponto marca o início do seu traçado</li>
                  <li>Será usado como referência para o rastreamento</li>
                  <li>Na próxima etapa, você percorrerá o circuito</li>
                  <li>
                    O sistema capturará pontos automaticamente e plotará o
                    traçado no mapa
                  </li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
