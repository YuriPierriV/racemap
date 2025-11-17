/* eslint-disable no-undef */
import { useEffect, useRef, useState, useMemo } from "react";
import { Route, Satellite, Layers } from "lucide-react";
import { CiMap } from "react-icons/ci";
import { useTheme } from "next-themes";

const MapPreviewClean = ({
  points = [],
  direction = "clockwise",
  className = "h-96 w-full",
  showStartOnly = false,
  showCurrentPosition = true,
  onStartPositionChange = null,
}) => {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersLayerRef = useRef(null);
  const tileLayerRef = useRef(null);
  const [isClient, setIsClient] = useState(false);
  const [trackDistance, setTrackDistance] = useState(0);
  const [mapStyle, setMapStyle] = useState("medium"); // 'minimal', 'medium', 'satellite'
  const { theme, systemTheme } = useTheme();

  const mapId = useMemo(
    () => `map-clean-${Math.random().toString(36).substr(2, 9)}`,
    [],
  );

  // Determinar o tema efetivo (considerando system theme)
  const effectiveTheme = theme === "system" ? systemTheme : theme;

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (!isClient || !mapRef.current || points.length === 0) return;

    // Limpar instância anterior se existir
    if (mapInstanceRef.current) {
      try {
        mapInstanceRef.current.off();
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      } catch (error) {
        console.warn("Erro ao limpar mapa anterior:", error);
      }
    }

    let isMounted = true;

    const timeoutId = setTimeout(async () => {
      try {
        const [L] = await Promise.all([
          import("leaflet"),
          import("leaflet/dist/leaflet.css"),
        ]);
        if (!isMounted) return;

        const LeafletModule = L.default || L;

        if (LeafletModule.Icon?.Default?.prototype) {
          delete LeafletModule.Icon.Default.prototype._getIconUrl;
          LeafletModule.Icon.Default.mergeOptions({
            iconRetinaUrl:
              "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
            iconUrl:
              "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
            shadowUrl:
              "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
          });
        }

        const normalizedPoints = points
          .map((point) => {
            if (Array.isArray(point)) {
              return { lat: point[0], lng: point[1] };
            }
            return { lat: point.lat, lng: point.lng || point.long };
          })
          .filter((point) => {
            const isValid =
              point.lat != null &&
              point.lng != null &&
              !isNaN(point.lat) &&
              !isNaN(point.lng) &&
              point.lat !== 0 &&
              point.lng !== 0;
            return isValid;
          });

        if (normalizedPoints.length === 0) return;

        let totalDistance = 0;
        for (let i = 0; i < normalizedPoints.length - 1; i++) {
          const p1 = normalizedPoints[i];
          const p2 = normalizedPoints[i + 1];

          const R = 6371000;
          const dLat = ((p2.lat - p1.lat) * Math.PI) / 180;
          const dLng = ((p2.lng - p1.lng) * Math.PI) / 180;
          const a =
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos((p1.lat * Math.PI) / 180) *
              Math.cos((p2.lat * Math.PI) / 180) *
              Math.sin(dLng / 2) *
              Math.sin(dLng / 2);
          const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
          totalDistance += R * c;
        }

        setTrackDistance(totalDistance);
        const map = LeafletModule.map(mapRef.current, {
          center: [normalizedPoints[0].lat, normalizedPoints[0].lng],
          zoom: 17,
          zoomControl: false,
          attributionControl: false,
          dragging: false,
          touchZoom: false,
          doubleClickZoom: false,
          scrollWheelZoom: false,
          boxZoom: false,
          keyboard: false,
        });

        // Função para obter a URL do tile layer baseado no estilo
        const getTileLayer = (style, isDark) => {
          switch (style) {
            case "minimal":
              return null;
            case "medium":
              if (isDark) {
                return {
                  url: "https://{s}.basemaps.cartocdn.com/dark_nolabels/{z}/{x}/{y}{r}.png",
                  attribution: "",
                  maxZoom: 19,
                };
              } else {
                return {
                  url: "https://{s}.basemaps.cartocdn.com/light_nolabels/{z}/{x}/{y}{r}.png",
                  attribution: "",
                  maxZoom: 19,
                };
              }
            case "satellite":
              return {
                url: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
                attribution: "",
                maxZoom: 19,
              };
            default:
              return {
                url: "https://{s}.basemaps.cartocdn.com/light_nolabels/{z}/{x}/{y}{r}.png",
                attribution: "",
                maxZoom: 19,
              };
          }
        };

        const isDarkTheme = effectiveTheme === "dark";
        const initialTileConfig = getTileLayer(mapStyle, isDarkTheme);
        if (initialTileConfig) {
          tileLayerRef.current = LeafletModule.tileLayer(
            initialTileConfig.url,
            {
              attribution: initialTileConfig.attribution,
              maxZoom: initialTileConfig.maxZoom,
            },
          ).addTo(map);
        } else {
          map.getContainer().style.backgroundColor = isDarkTheme
            ? "#1f2937"
            : "#f5f5f5";
        }

        mapInstanceRef.current = map;

        const markersLayer = LeafletModule.layerGroup().addTo(map);
        markersLayerRef.current = markersLayer;

        if (showStartOnly && normalizedPoints.length === 1) {
          const startCursorIcon = LeafletModule.icon({
            iconUrl: "/cursor.png",
            iconSize: [24, 24],
            iconAnchor: [12, 12],
            popupAnchor: [0, -12],
          });

          LeafletModule.marker(
            [normalizedPoints[0].lat, normalizedPoints[0].lng],
            {
              icon: startCursorIcon,
            },
          )
            .bindPopup("<strong>📍 Ponto Inicial</strong>")
            .addTo(markersLayer);

          map.setView([normalizedPoints[0].lat, normalizedPoints[0].lng], 17);
        } else {
          // Criar array com circuito fechado (último ponto conecta ao primeiro)
          const closedCircuitPoints = [
            ...normalizedPoints,
            normalizedPoints[0],
          ];

          // Função para suavizar curvas usando Catmull-Rom spline
          const smoothCurve = (points, tension = 0.5, numOfSegments = 20) => {
            if (points.length < 2) return points;

            const smoothPoints = [];

            // Para circuito fechado, adicionar pontos extras no início e fim para continuidade
            const extendedPoints = [
              points[points.length - 2],
              ...points,
              points[1],
            ];

            for (let i = 1; i < extendedPoints.length - 2; i++) {
              const p0 = extendedPoints[i - 1];
              const p1 = extendedPoints[i];
              const p2 = extendedPoints[i + 1];
              const p3 = extendedPoints[i + 2];

              for (let t = 0; t < numOfSegments; t++) {
                const tt = t / numOfSegments;
                const tt2 = tt * tt;
                const tt3 = tt2 * tt;

                // Catmull-Rom formula
                const q0 = -tension * tt3 + 2 * tension * tt2 - tension * tt;
                const q1 = (2 - tension) * tt3 + (tension - 3) * tt2 + 1;
                const q2 =
                  (tension - 2) * tt3 + (3 - 2 * tension) * tt2 + tension * tt;
                const q3 = tension * tt3 - tension * tt2;

                const lat =
                  p0.lat * q0 + p1.lat * q1 + p2.lat * q2 + p3.lat * q3;
                const lng =
                  p0.lng * q0 + p1.lng * q1 + p2.lng * q2 + p3.lng * q3;

                smoothPoints.push({ lat, lng });
              }
            }

            return smoothPoints;
          };

          // Suavizar as curvas
          const smoothedPoints = smoothCurve(closedCircuitPoints, 0.5, 15);

          LeafletModule.polyline(
            smoothedPoints.map((point) => [point.lat, point.lng]),
            {
              color: direction === "clockwise" ? "#3b82f6" : "#ef4444",
              weight: 4,
              opacity: 0.8,
              smoothFactor: 1.5,
            },
          ).addTo(markersLayer);

          // Adicionar seta indicadora de direção próxima à bandeira
          if (normalizedPoints.length > 2) {
            const arrowPositionIndex = Math.min(
              2,
              Math.floor(normalizedPoints.length / 20),
            );
            const arrowPoint = normalizedPoints[arrowPositionIndex];
            const nextArrowPoint =
              normalizedPoints[arrowPositionIndex + 1] || normalizedPoints[0];

            // Calcular ângulo da seta (bearing) do ponto atual para o próximo
            // Não precisa inverter +180° porque o array já está reordenado quando anti-horário
            const deltaLat = nextArrowPoint.lat - arrowPoint.lat;
            const deltaLng = nextArrowPoint.lng - arrowPoint.lng;
            const angle = Math.atan2(deltaLng, deltaLat) * (180 / Math.PI);

            const directionArrowIcon = LeafletModule.divIcon({
              className: "direction-arrow-icon",
              html: `<div style="width: 28px; height: 28px; transform: rotate(${angle}deg); transform-origin: center;">
                <svg width="28" height="28" viewBox="0 0 28 28" xmlns="http://www.w3.org/2000/svg">
                  <defs>
                    <filter id="shadow-arrow-clean" x="-50%" y="-50%" width="200%" height="200%">
                      <feDropShadow dx="0" dy="1" stdDeviation="2" flood-opacity="0.2"/>
                    </filter>
                  </defs>
                  <!-- Círculo de fundo branco -->
                  <circle cx="14" cy="14" r="12" fill="white" opacity="0.98" filter="url(#shadow-arrow-clean)"/>
                  <circle cx="14" cy="14" r="12" fill="none" stroke="#e5e7eb" stroke-width="1.5"/>
                  <!-- Linha vertical da seta -->
                  <line x1="14" y1="20" x2="14" y2="8" stroke="#1f2937" stroke-width="2" stroke-linecap="round"/>
                  <!-- Ponta da seta -->
                  <path d="M14 6 L10 11 L14 9.5 L18 11 Z" fill="#1f2937" stroke="#1f2937" stroke-width="0.5" stroke-linejoin="round"/>
                </svg>
              </div>`,
              iconSize: [28, 28],
              iconAnchor: [14, 14],
            });

            LeafletModule.marker([arrowPoint.lat, arrowPoint.lng], {
              icon: directionArrowIcon,
              interactive: false,
              zIndexOffset: 500,
            }).addTo(markersLayer);
          }

          const startFlagIcon = LeafletModule.divIcon({
            className: "custom-div-icon",
            html: '<div style="width: 28px; height: 28px; display: flex; align-items: center; justify-content: center; font-size: 24px; line-height: 1; text-shadow: 1px 1px 3px rgba(0,0,0,0.5), 0 0 5px rgba(255,255,255,0.5); cursor: move;">🏁</div>',
            iconSize: [28, 28],
            iconAnchor: [14, 28],
          });

          const startMarker = LeafletModule.marker(
            [normalizedPoints[0].lat, normalizedPoints[0].lng],
            {
              icon: startFlagIcon,
              draggable: !!onStartPositionChange,
            },
          )
            .bindPopup("<strong>🏁 Largada</strong>")
            .addTo(markersLayer);

          if (onStartPositionChange) {
            startMarker.on("dragend", function (event) {
              const marker = event.target;
              const position = marker.getLatLng();

              // Encontrar o ponto mais próximo do traçado
              let closestPoint = normalizedPoints[0];
              let minDistance = Number.MAX_VALUE;

              normalizedPoints.forEach((point) => {
                const dLat = ((point.lat - position.lat) * Math.PI) / 180;
                const dLng = ((point.lng - position.lng) * Math.PI) / 180;
                const a =
                  Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                  Math.cos((position.lat * Math.PI) / 180) *
                    Math.cos((point.lat * Math.PI) / 180) *
                    Math.sin(dLng / 2) *
                    Math.sin(dLng / 2);
                const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
                const distance = 6371000 * c; // Raio da Terra em metros

                if (distance < minDistance) {
                  minDistance = distance;
                  closestPoint = point;
                }
              });

              // Snap para o ponto mais próximo
              marker.setLatLng([closestPoint.lat, closestPoint.lng]);
              onStartPositionChange(
                closestPoint.lat,
                closestPoint.lng,
                closestPoint.index,
              );
            });
          }

          if (normalizedPoints.length > 1 && showCurrentPosition) {
            const currentPositionIcon = LeafletModule.icon({
              iconUrl: "/cursor.png",
              iconSize: [32, 32],
              iconAnchor: [16, 16],
              popupAnchor: [0, -16],
            });

            LeafletModule.marker(
              [
                normalizedPoints[normalizedPoints.length - 1].lat,
                normalizedPoints[normalizedPoints.length - 1].lng,
              ],
              { icon: currentPositionIcon },
            )
              .bindPopup("<strong>Posição Atual</strong>")
              .addTo(markersLayer);
          }

          const bounds = LeafletModule.latLngBounds(
            normalizedPoints.map((point) => [point.lat, point.lng]),
          );
          map.fitBounds(bounds, { padding: [20, 20], animate: false });
        }
      } catch (error) {
        console.error("Erro ao carregar Leaflet:", error);
      }
    }, 500);

    return () => {
      isMounted = false;
      clearTimeout(timeoutId);
    };
  }, [
    points,
    direction,
    showStartOnly,
    showCurrentPosition,
    onStartPositionChange,
    isClient,
    mapStyle,
    effectiveTheme,
  ]);

  // Efeito para atualizar o tile layer quando o estilo mudar
  useEffect(() => {
    if (!mapInstanceRef.current || !tileLayerRef.current) return;

    const updateTileLayer = async () => {
      const L = await import("leaflet");
      const LeafletModule = L.default || L;

      const getTileLayer = (style, isDark) => {
        switch (style) {
          case "minimal":
            return null;
          case "medium":
            if (isDark) {
              return {
                url: "https://{s}.basemaps.cartocdn.com/dark_nolabels/{z}/{x}/{y}{r}.png",
                attribution: "",
                maxZoom: 19,
              };
            } else {
              return {
                url: "https://{s}.basemaps.cartocdn.com/light_nolabels/{z}/{x}/{y}{r}.png",
                attribution: "",
                maxZoom: 19,
              };
            }
          case "satellite":
            return {
              url: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
              attribution: "",
              maxZoom: 19,
            };
          default:
            return {
              url: "https://{s}.basemaps.cartocdn.com/light_nolabels/{z}/{x}/{y}{r}.png",
              attribution: "",
              maxZoom: 19,
            };
        }
      };

      // Remover camada antiga
      if (tileLayerRef.current) {
        mapInstanceRef.current.removeLayer(tileLayerRef.current);
        tileLayerRef.current = null;
      }

      // Adicionar nova camada
      const isDarkTheme = effectiveTheme === "dark";
      const newTileConfig = getTileLayer(mapStyle, isDarkTheme);
      if (newTileConfig) {
        tileLayerRef.current = LeafletModule.tileLayer(newTileConfig.url, {
          attribution: newTileConfig.attribution,
          maxZoom: newTileConfig.maxZoom,
        }).addTo(mapInstanceRef.current);
        mapInstanceRef.current.getContainer().style.backgroundColor = "";
      } else {
        mapInstanceRef.current.getContainer().style.backgroundColor =
          isDarkTheme ? "#1f2937" : "#f5f5f5";
      }
    };

    updateTileLayer();
  }, [mapStyle, effectiveTheme]);

  useEffect(() => {
    return () => {
      if (mapInstanceRef.current) {
        try {
          mapInstanceRef.current.off();
          mapInstanceRef.current.remove();
          mapInstanceRef.current = null;
        } catch (error) {
          console.warn("Erro ao limpar mapa:", error);
        }
      }
    };
  }, []);

  if (!isClient) {
    return (
      <div className={"relative " + className}>
        <div className="h-full w-full rounded-lg border border-gray-200 bg-gray-100 flex items-center justify-center">
          <span className="text-gray-500 text-sm">Carregando mapa...</span>
        </div>
      </div>
    );
  }

  return (
    <div className={"relative " + className}>
      <div
        ref={mapRef}
        id={mapId}
        className="h-full w-full rounded-lg border border-gray-200"
      />

      {/* Badge de distância */}
      {points.length > 1 && trackDistance > 0 && (
        <div className="absolute top-2 right-2 bg-background/95 backdrop-blur-sm rounded px-2 py-1 shadow-sm border border-border">
          <div className="flex items-center gap-1.5 text-xs font-medium">
            <Route className="w-3.5 h-3.5 text-primary" />
            <span className="text-foreground">
              {trackDistance >= 1000
                ? (trackDistance / 1000).toFixed(2) + " km"
                : Math.round(trackDistance) + " m"}
            </span>
          </div>
        </div>
      )}

      {/* Controle de estilo de mapa */}
      <div className="absolute top-2 left-2 bg-background/95 backdrop-blur-sm rounded-lg shadow-lg border border-border overflow-hidden">
        <div className="flex">
          <button
            onClick={() => setMapStyle("minimal")}
            className={`px-2.5 py-1.5 flex items-center justify-center transition-colors ${
              mapStyle === "minimal"
                ? "bg-primary text-primary-foreground"
                : "bg-background text-foreground hover:bg-accent"
            }`}
            title="Modo Mínimo - Apenas traçado"
          >
            <Layers className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setMapStyle("medium")}
            className={`px-2.5 py-1.5 flex items-center justify-center transition-colors border-l border-border ${
              mapStyle === "medium"
                ? "bg-primary text-primary-foreground"
                : "bg-background text-foreground hover:bg-accent"
            }`}
            title="Mapa Limpo"
          >
            <CiMap className="w-4 h-4" />
          </button>
          <button
            onClick={() => setMapStyle("satellite")}
            className={`px-2.5 py-1.5 flex items-center justify-center transition-colors border-l border-border ${
              mapStyle === "satellite"
                ? "bg-primary text-primary-foreground"
                : "bg-background text-foreground hover:bg-accent"
            }`}
            title="Mapa Satélite"
          >
            <Satellite className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default MapPreviewClean;
