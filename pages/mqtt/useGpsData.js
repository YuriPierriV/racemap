import { useState, useRef, useEffect, useCallback } from "react";
import useMqttSubscribe from "./useMqttSubscribe";
import useMqttMessages from "./useMqttMessages";

/**
 * Hook robusto para gerenciar dados GPS em tempo real
 * @param {string} deviceChipId - ID do chip do dispositivo
 * @param {object} options - Opções de configuração
 * @returns {object} - Dados e funções relacionadas ao GPS
 */
export const useGpsData = (deviceChipId, options = {}) => {
  const {
    enableTracking = false,
    maxTrackPoints = 1000,
    onPositionUpdate = null,
    onGpsStatusChange = null,
  } = options;

  // Estados principais
  const [gpsData, setGpsData] = useState({
    deviceId: null,
    gpsConnected: false,
    satellites: 0,
    lat: 0.0,
    long: 0.0,
    date: null,
    time: null,
    speedKmph: 0.0,
    lastUpdate: null,
  });

  const [trackPoints, setTrackPoints] = useState([]);
  const [isReceivingData, setIsReceivingData] = useState(false);
  const [connectionQuality, setConnectionQuality] = useState("unknown"); // excellent, good, poor, lost

  // Refs para gerenciamento
  const lastUpdateTimeRef = useRef(null);
  const dataTimeoutRef = useRef(null);
  const trackPointsRef = useRef([]);
  const previousGpsConnectedRef = useRef(null);

  // Tópico MQTT para escutar
  const topic = deviceChipId ? `webserver/${deviceChipId}` : null;

  // Subscribe ao tópico apenas se tiver deviceChipId
  useMqttSubscribe(topic ? [topic] : []);

  // Calcular qualidade da conexão baseado no intervalo de updates
  const calculateConnectionQuality = useCallback(() => {
    if (!lastUpdateTimeRef.current) return "unknown";

    const timeSinceLastUpdate = Date.now() - lastUpdateTimeRef.current;

    if (timeSinceLastUpdate < 2000) return "excellent";
    if (timeSinceLastUpdate < 5000) return "good";
    if (timeSinceLastUpdate < 10000) return "poor";
    return "lost";
  }, []);

  // Validar dados GPS recebidos
  const validateGpsData = useCallback((data) => {
    const required = ["deviceId", "gpsConnected", "lat", "long"];
    return required.every(field => data.hasOwnProperty(field));
  }, []);

  // Processar e armazenar ponto de rastreamento
  const addTrackPoint = useCallback((lat, long, speedKmph, timestamp) => {
    if (!enableTracking) return;
    if (!lat || !long) return;
    if (Math.abs(lat) < 0.0001 && Math.abs(long) < 0.0001) return; // Ignorar (0,0)

    const point = {
      lat,
      long,
      speed: speedKmph || 0,
      timestamp: timestamp || Date.now(),
    };

    trackPointsRef.current = [...trackPointsRef.current, point];

    // Limitar número de pontos
    if (trackPointsRef.current.length > maxTrackPoints) {
      trackPointsRef.current = trackPointsRef.current.slice(-maxTrackPoints);
    }

    setTrackPoints([...trackPointsRef.current]);
  }, [enableTracking, maxTrackPoints]);

  // Processar mensagem GPS recebida
  const processGpsMessage = useCallback((message) => {
    try {
      // Validar estrutura da mensagem
      if (!validateGpsData(message)) {
        console.warn("Dados GPS inválidos recebidos:", message);
        return;
      }

      const now = Date.now();
      lastUpdateTimeRef.current = now;
      setIsReceivingData(true);

      // Atualizar estado principal
      const newGpsData = {
        deviceId: message.deviceId,
        gpsConnected: message.gpsConnected,
        satellites: message.satellites || 0,
        lat: parseFloat(message.lat) || 0.0,
        long: parseFloat(message.long) || 0.0,
        date: message.date,
        time: message.time,
        speedKmph: parseFloat(message.speedKmph) || 0.0,
        lastUpdate: now,
      };

      setGpsData(newGpsData);

      // Adicionar ponto de rastreamento se GPS estiver conectado e tiver coordenadas válidas
      if (newGpsData.gpsConnected && newGpsData.lat !== 0 && newGpsData.long !== 0) {
        addTrackPoint(newGpsData.lat, newGpsData.long, newGpsData.speedKmph, now);
      }

      // Callback de atualização de posição
      if (onPositionUpdate) {
        onPositionUpdate(newGpsData);
      }

      // Callback de mudança de status do GPS
      if (previousGpsConnectedRef.current !== null && 
          previousGpsConnectedRef.current !== newGpsData.gpsConnected) {
        if (onGpsStatusChange) {
          onGpsStatusChange(newGpsData.gpsConnected);
        }
      }
      previousGpsConnectedRef.current = newGpsData.gpsConnected;

      // Atualizar qualidade da conexão
      setConnectionQuality(calculateConnectionQuality());

      // Configurar timeout para detectar perda de conexão
      if (dataTimeoutRef.current) {
        clearTimeout(dataTimeoutRef.current);
      }

      dataTimeoutRef.current = setTimeout(() => {
        setIsReceivingData(false);
        setConnectionQuality("lost");
      }, 15000); // 15 segundos sem dados = perda de conexão

    } catch (error) {
      console.error("Erro ao processar dados GPS:", error);
    }
  }, [validateGpsData, addTrackPoint, calculateConnectionQuality, onPositionUpdate, onGpsStatusChange]);

  // Escutar mensagens MQTT
  useMqttMessages((receivedTopic, message) => {
    if (receivedTopic === topic) {
      processGpsMessage(message);
    }
  });

  // Limpar rastreamento
  const clearTrack = useCallback(() => {
    trackPointsRef.current = [];
    setTrackPoints([]);
  }, []);

  // Obter estatísticas do rastreamento
  const getTrackStats = useCallback(() => {
    if (trackPoints.length === 0) {
      return {
        totalPoints: 0,
        distance: 0,
        maxSpeed: 0,
        avgSpeed: 0,
        duration: 0,
      };
    }

    const speeds = trackPoints.map(p => p.speed);
    const maxSpeed = Math.max(...speeds);
    const avgSpeed = speeds.reduce((a, b) => a + b, 0) / speeds.length;
    
    const duration = trackPoints.length > 1 
      ? (trackPoints[trackPoints.length - 1].timestamp - trackPoints[0].timestamp) / 1000 
      : 0;

    // Calcular distância aproximada usando fórmula de Haversine
    let totalDistance = 0;
    for (let i = 1; i < trackPoints.length; i++) {
      const R = 6371e3; // raio da Terra em metros
      const φ1 = trackPoints[i - 1].lat * Math.PI / 180;
      const φ2 = trackPoints[i].lat * Math.PI / 180;
      const Δφ = (trackPoints[i].lat - trackPoints[i - 1].lat) * Math.PI / 180;
      const Δλ = (trackPoints[i].long - trackPoints[i - 1].long) * Math.PI / 180;

      const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
                Math.cos(φ1) * Math.cos(φ2) *
                Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

      totalDistance += R * c;
    }

    return {
      totalPoints: trackPoints.length,
      distance: totalDistance, // em metros
      maxSpeed,
      avgSpeed,
      duration, // em segundos
    };
  }, [trackPoints]);

  // Limpar timeouts ao desmontar
  useEffect(() => {
    return () => {
      if (dataTimeoutRef.current) {
        clearTimeout(dataTimeoutRef.current);
      }
    };
  }, []);

  // Retornar dados e funções
  return {
    // Dados principais
    gpsData,
    trackPoints,
    
    // Status
    isReceivingData,
    connectionQuality,
    isGpsConnected: gpsData.gpsConnected,
    hasValidPosition: gpsData.lat !== 0 && gpsData.long !== 0,
    
    // Funções
    clearTrack,
    getTrackStats,
    
    // Dados extras
    currentPosition: gpsData.lat && gpsData.long ? [gpsData.lat, gpsData.long] : null,
    lastUpdate: gpsData.lastUpdate,
  };
};

export default useGpsData;
