import { useEffect, useRef, useState, useMemo } from 'react';
import { Route, Satellite, Layers } from 'lucide-react';
import { CiMap } from 'react-icons/ci';
import { useTheme } from 'next-themes';

const MapEditablePreview = ({ 
  points = [], 
  direction = 'clockwise', 
  className = "h-96 w-full",
  onStartPositionChange = null
}) => {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const tileLayerRef = useRef(null);
  const [isClient, setIsClient] = useState(false);
  const [trackDistance, setTrackDistance] = useState(0);
  const [mapStyle, setMapStyle] = useState('medium'); // 'minimal', 'medium', 'satellite'
  const { theme, systemTheme } = useTheme();
  
  const mapId = useMemo(() => `map-edit-${Math.random().toString(36).substr(2, 9)}`, []);
  
  // Determinar o tema efetivo (considerando system theme)
  const effectiveTheme = theme === 'system' ? systemTheme : theme;

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (!isClient || !mapRef.current || points.length === 0) return;

    console.log('MapEditablePreview - Criando mapa editável com', points.length, 'pontos');
    console.log('MapEditablePreview - Primeiros 3 pontos:', points.slice(0, 3));

    // Limpar instância anterior
    if (mapInstanceRef.current) {
      try {
        mapInstanceRef.current.off();
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      } catch (error) {
        console.warn('Erro ao limpar mapa:', error);
      }
    }

    let isMounted = true;
    
    const timeoutId = setTimeout(() => {
      Promise.all([
        import('leaflet'),
        import('leaflet/dist/leaflet.css')
      ]).then(([L]) => {
        if (!isMounted || !mapRef.current) {
          console.log('MapEditablePreview - Componente desmontado ou ref não disponível');
          return;
        }
        
        const LeafletModule = L.default || L;

        // Configurar ícones padrão
        if (LeafletModule.Icon?.Default?.prototype) {
          delete LeafletModule.Icon.Default.prototype._getIconUrl;
          LeafletModule.Icon.Default.mergeOptions({
            iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
            iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
            shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
          });
        }

        const normalizedPoints = points.map(point => {
          // Lidar com diferentes formatos de pontos
          if (point.latitude !== undefined && point.longitude !== undefined) {
            return { lat: point.latitude, lng: point.longitude };
          }
          if (point.lat !== undefined && point.lng !== undefined) {
            return { lat: point.lat, lng: point.lng };
          }
          if (point.lat !== undefined && point.long !== undefined) {
            return { lat: point.lat, lng: point.long };
          }
          if (Array.isArray(point) && point.length >= 2) {
            return { lat: point[0], lng: point[1] };
          }
          return null;
        }).filter(point => {
          // Filtrar pontos inválidos
          return point !== null && 
                 point.lat != null && point.lng != null &&
                 !isNaN(point.lat) && !isNaN(point.lng) &&
                 point.lat !== 0 && point.lng !== 0;
        });

        console.log('MapEditablePreview - Pontos normalizados:', normalizedPoints.length, 'de', points.length);

        if (normalizedPoints.length === 0) {
          console.error('MapEditablePreview - Nenhum ponto válido encontrado');
          return;
        }

        // Criar nova instância do mapa
        const map = LeafletModule.map(mapRef.current, {
          zoomControl: false,
          attributionControl: false,
          scrollWheelZoom: true,
          dragging: true,
          touchZoom: true,
          doubleClickZoom: true,
        });

        mapInstanceRef.current = map;

        // Função para obter a URL do tile layer baseado no estilo e tema
        const getTileLayer = (style, isDark) => {
          switch(style) {
            case 'minimal':
              // Sem mapa de fundo - apenas fundo adaptativo
              return null; // Não adiciona tile layer
            case 'medium':
              // Mapa limpo/minimalista com suporte dark/light
              if (isDark) {
                return {
                  url: 'https://{s}.basemaps.cartocdn.com/dark_nolabels/{z}/{x}/{y}{r}.png',
                  attribution: '',
                  maxZoom: 19
                };
              } else {
                return {
                  url: 'https://{s}.basemaps.cartocdn.com/light_nolabels/{z}/{x}/{y}{r}.png',
                  attribution: '',
                  maxZoom: 19
                };
              }
            case 'satellite':
              // Mapa satélite com vegetação (não muda com tema)
              return {
                url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
                attribution: '',
                maxZoom: 19
              };
            default:
              return {
                url: 'https://{s}.basemaps.cartocdn.com/light_nolabels/{z}/{x}/{y}{r}.png',
                attribution: '',
                maxZoom: 19
              };
          }
        };

        // Adicionar camada de tiles inicial (se não for minimal)
        const isDarkTheme = effectiveTheme === 'dark';
        const initialTileConfig = getTileLayer(mapStyle, isDarkTheme);
        if (initialTileConfig) {
          tileLayerRef.current = LeafletModule.tileLayer(initialTileConfig.url, {
            attribution: initialTileConfig.attribution,
            maxZoom: initialTileConfig.maxZoom,
          }).addTo(map);
        } else {
          // Para modo minimal, adicionar fundo adaptativo ao tema
          map.getContainer().style.backgroundColor = isDarkTheme ? '#1f2937' : '#f5f5f5';
        }

        // Calcular bounds
        const bounds = LeafletModule.latLngBounds(
          normalizedPoints.map(p => [p.lat, p.lng])
        );
        map.fitBounds(bounds, { padding: [50, 50] });

        // Criar array de pontos incluindo o fechamento do circuito (último ponto conecta ao primeiro)
        const closedCircuitPoints = [...normalizedPoints, normalizedPoints[0]];

        // Função para suavizar curvas usando Catmull-Rom spline
        const smoothCurve = (points, tension = 0.5, numOfSegments = 20) => {
          if (points.length < 2) return points;
          
          const smoothPoints = [];
          
          // Para circuito fechado, adicionar pontos extras no início e fim para continuidade
          const extendedPoints = [
            points[points.length - 2],
            ...points,
            points[1]
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
              const q2 = (tension - 2) * tt3 + (3 - 2 * tension) * tt2 + tension * tt;
              const q3 = tension * tt3 - tension * tt2;
              
              const lat = p0.lat * q0 + p1.lat * q1 + p2.lat * q2 + p3.lat * q3;
              const lng = p0.lng * q0 + p1.lng * q1 + p2.lng * q2 + p3.lng * q3;
              
              smoothPoints.push({ lat, lng });
            }
          }
          
          return smoothPoints;
        };

        // Suavizar as curvas
        const smoothedPoints = smoothCurve(closedCircuitPoints, 0.5, 15);

        // Desenhar linha do percurso (circuito fechado com curvas suavizadas)
        const polyline = LeafletModule.polyline(
          smoothedPoints.map(p => [p.lat, p.lng]),
          {
            color: '#2563eb',
            weight: 4,
            opacity: 0.8,
            smoothFactor: 1.5,
          }
        ).addTo(map);

        // Calcular distância total (incluindo volta ao início)
        let totalDistance = 0;
        for (let i = 0; i < closedCircuitPoints.length - 1; i++) {
          const from = LeafletModule.latLng(closedCircuitPoints[i].lat, closedCircuitPoints[i].lng);
          const to = LeafletModule.latLng(closedCircuitPoints[i + 1].lat, closedCircuitPoints[i + 1].lng);
          totalDistance += from.distanceTo(to);
        }
        setTrackDistance(totalDistance);

        // Criar ícone da bandeira de largada
        const startFlagIcon = LeafletModule.divIcon({
          html: '<div style="font-size: 28px; line-height: 1;">🏁</div>',
          className: 'custom-flag-icon',
          iconSize: [28, 28],
          iconAnchor: [14, 14],
        });

        // Adicionar bandeira no ponto inicial (ARRASTÁVEL)
        const startPoint = normalizedPoints[0];
        const startMarker = LeafletModule.marker([startPoint.lat, startPoint.lng], {
          icon: startFlagIcon,
          draggable: !!onStartPositionChange, // Arrastável apenas se callback fornecido
          zIndexOffset: 1000,
        }).addTo(map);

        // Handler para quando a bandeira for arrastada
        if (onStartPositionChange) {
          startMarker.on('dragend', function(event) {
            const position = event.target.getLatLng();
            console.log('MapEditablePreview - Bandeira arrastada para:', position);

            // Encontrar o ponto mais próximo do traçado
            let closestPoint = null;
            let closestDistance = Infinity;
            let closestIndex = 0;

            normalizedPoints.forEach((point, index) => {
              const pointLatLng = LeafletModule.latLng(point.lat, point.lng);
              const distance = position.distanceTo(pointLatLng);
              
              if (distance < closestDistance) {
                closestDistance = distance;
                closestPoint = point;
                closestIndex = index;
              }
            });

            if (closestPoint) {
              console.log('MapEditablePreview - Ponto mais próximo:', closestIndex, closestPoint);
              // Encaixar a bandeira no ponto mais próximo
              startMarker.setLatLng([closestPoint.lat, closestPoint.lng]);
              // Notificar o componente pai
              onStartPositionChange(closestPoint.lat, closestPoint.lng, closestIndex);
            }
          });
        }

        // Adicionar seta indicadora de direção próxima à bandeira
        if (normalizedPoints.length > 2) {
          // Calcular posição para a seta (2-3 pontos após a largada - bem próxima)
          const arrowPositionIndex = Math.min(2, Math.floor(normalizedPoints.length / 20));
          const arrowPoint = normalizedPoints[arrowPositionIndex];
          const nextArrowPoint = normalizedPoints[arrowPositionIndex + 1] || normalizedPoints[0];

          // Calcular ângulo da seta (bearing) do ponto atual para o próximo
          // Não precisa inverter +180° porque o array já está reordenado quando anti-horário
          const deltaLat = nextArrowPoint.lat - arrowPoint.lat;
          const deltaLng = nextArrowPoint.lng - arrowPoint.lng;
          const angle = Math.atan2(deltaLng, deltaLat) * (180 / Math.PI);

          const directionArrowIcon = LeafletModule.divIcon({
            className: 'direction-arrow-icon',
            html: `<div style="width: 28px; height: 28px; transform: rotate(${angle}deg); transform-origin: center;">
              <svg width="28" height="28" viewBox="0 0 28 28" xmlns="http://www.w3.org/2000/svg">
                <defs>
                  <filter id="shadow-arrow" x="-50%" y="-50%" width="200%" height="200%">
                    <feDropShadow dx="0" dy="1" stdDeviation="2" flood-opacity="0.2"/>
                  </filter>
                </defs>
                <!-- Círculo de fundo branco -->
                <circle cx="14" cy="14" r="12" fill="white" opacity="0.98" filter="url(#shadow-arrow)"/>
                <circle cx="14" cy="14" r="12" fill="none" stroke="#e5e7eb" stroke-width="1.5"/>
                <!-- Linha vertical da seta -->
                <line x1="14" y1="20" x2="14" y2="8" stroke="#1f2937" stroke-width="2" stroke-linecap="round"/>
                <!-- Ponta da seta -->
                <path d="M14 6 L10 11 L14 9.5 L18 11 Z" fill="#1f2937" stroke="#1f2937" stroke-width="0.5" stroke-linejoin="round"/>
              </svg>
            </div>`,
            iconSize: [28, 28],
            iconAnchor: [14, 14]
          });

          LeafletModule.marker([arrowPoint.lat, arrowPoint.lng], {
            icon: directionArrowIcon,
            interactive: false,
            zIndexOffset: 500,
          }).addTo(map);
        }

        console.log('MapEditablePreview - Mapa criado com sucesso');

      }).catch(error => {
        console.error('MapEditablePreview - Erro ao carregar Leaflet:', error);
      });
    }, 200);

    return () => {
      isMounted = false;
      clearTimeout(timeoutId);
      if (mapInstanceRef.current) {
        try {
          mapInstanceRef.current.off();
          mapInstanceRef.current.remove();
          mapInstanceRef.current = null;
        } catch (error) {
          console.warn('Erro ao limpar mapa no cleanup:', error);
        }
      }
    };
  }, [points, direction, onStartPositionChange, isClient, mapStyle, effectiveTheme]);

  // Efeito para atualizar o tile layer quando o estilo mudar
  useEffect(() => {
    if (!mapInstanceRef.current || !tileLayerRef.current) return;

    const updateTileLayer = async () => {
      const L = await import('leaflet');
      const LeafletModule = L.default || L;

      const getTileLayer = (style, isDark) => {
        switch(style) {
          case 'minimal':
            return null;
          case 'medium':
            if (isDark) {
              return {
                url: 'https://{s}.basemaps.cartocdn.com/dark_nolabels/{z}/{x}/{y}{r}.png',
                attribution: '',
                maxZoom: 19
              };
            } else {
              return {
                url: 'https://{s}.basemaps.cartocdn.com/light_nolabels/{z}/{x}/{y}{r}.png',
                attribution: '',
                maxZoom: 19
              };
            }
          case 'satellite':
            return {
              url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
              attribution: '',
              maxZoom: 19
            };
          default:
            return {
              url: 'https://{s}.basemaps.cartocdn.com/light_nolabels/{z}/{x}/{y}{r}.png',
              attribution: '',
              maxZoom: 19
            };
        }
      };

      // Remover camada antiga
      if (tileLayerRef.current) {
        mapInstanceRef.current.removeLayer(tileLayerRef.current);
        tileLayerRef.current = null;
      }

      // Adicionar nova camada
      const isDarkTheme = effectiveTheme === 'dark';
      const newTileConfig = getTileLayer(mapStyle, isDarkTheme);
      if (newTileConfig) {
        tileLayerRef.current = LeafletModule.tileLayer(newTileConfig.url, {
          attribution: newTileConfig.attribution,
          maxZoom: newTileConfig.maxZoom,
        }).addTo(mapInstanceRef.current);
        mapInstanceRef.current.getContainer().style.backgroundColor = '';
      } else {
        // Modo minimal - sem tiles, fundo adaptativo ao tema
        mapInstanceRef.current.getContainer().style.backgroundColor = isDarkTheme ? '#1f2937' : '#f5f5f5';
      }
    };

    updateTileLayer();
  }, [mapStyle]);

  if (!isClient) {
    return (
      <div className={className}>
        <div className="w-full h-full bg-muted rounded-lg flex items-center justify-center">
          <p className="text-sm text-muted-foreground">Carregando mapa...</p>
        </div>
      </div>
    );
  }

  const formatDistance = (meters) => {
    if (meters >= 1000) {
      return `${(meters / 1000).toFixed(2)} km`;
    }
    return `${meters.toFixed(0)} m`;
  };

  return (
    <div className="relative">
      <div ref={mapRef} id={mapId} className={className} />
      
      {/* Badge de distância */}
      {trackDistance > 0 && (
        <div className="absolute top-4 right-4 bg-background/95 backdrop-blur-sm px-3 py-2 rounded-lg shadow-lg border border-border">
          <div className="flex items-center gap-2">
            <Route className="w-4 h-4 text-primary" />
            <span className="text-sm font-semibold text-foreground">
              {formatDistance(trackDistance)}
            </span>
          </div>
        </div>
      )}

      {/* Controle de estilo de mapa */}
      <div className="absolute top-4 left-4 bg-background/95 backdrop-blur-sm rounded-lg shadow-lg border border-border overflow-hidden">
        <div className="flex">
          <button
            onClick={() => setMapStyle('minimal')}
            className={`px-3 py-2 flex items-center justify-center transition-colors ${
              mapStyle === 'minimal' 
                ? 'bg-primary text-primary-foreground' 
                : 'bg-background text-foreground hover:bg-accent'
            }`}
            title="Modo Mínimo - Apenas traçado"
          >
            <Layers className="w-4 h-4" />
          </button>
          <button
            onClick={() => setMapStyle('medium')}
            className={`px-3 py-2 flex items-center justify-center transition-colors border-l border-border ${
              mapStyle === 'medium' 
                ? 'bg-primary text-primary-foreground' 
                : 'bg-background text-foreground hover:bg-accent'
            }`}
            title="Mapa Limpo"
          >
            <CiMap className="w-5 h-5" />
          </button>
          <button
            onClick={() => setMapStyle('satellite')}
            className={`px-3 py-2 flex items-center justify-center transition-colors border-l border-border ${
              mapStyle === 'satellite' 
                ? 'bg-primary text-primary-foreground' 
                : 'bg-background text-foreground hover:bg-accent'
            }`}
            title="Mapa Satélite"
          >
            <Satellite className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default MapEditablePreview;
