import React, { createContext, useContext, useState, useCallback } from "react";
import { useGpsData } from "./useGpsData";

const GpsTrackingContext = createContext();

/**
 * Provider para gerenciar rastreamento de múltiplos dispositivos GPS
 */
export const GpsTrackingProvider = ({ children }) => {
  const [trackedDevices, setTrackedDevices] = useState(new Map());
  const [activeDeviceId, setActiveDeviceId] = useState(null);

  // Iniciar rastreamento de um dispositivo
  const startTracking = useCallback((deviceChipId, options = {}) => {
    if (!deviceChipId) {
      console.warn("Tentativa de rastrear dispositivo sem chip_id");
      return false;
    }

    setTrackedDevices((prev) => {
      const newMap = new Map(prev);
      if (!newMap.has(deviceChipId)) {
        newMap.set(deviceChipId, {
          chipId: deviceChipId,
          startTime: Date.now(),
          isActive: true,
          options,
        });
      }
      return newMap;
    });

    return true;
  }, []);

  // Parar rastreamento de um dispositivo
  const stopTracking = useCallback((deviceChipId) => {
    setTrackedDevices((prev) => {
      const newMap = new Map(prev);
      const device = newMap.get(deviceChipId);
      if (device) {
        device.isActive = false;
        device.endTime = Date.now();
        newMap.set(deviceChipId, device);
      }
      return newMap;
    });
  }, []);

  // Remover dispositivo do rastreamento
  const removeDevice = useCallback((deviceChipId) => {
    setTrackedDevices((prev) => {
      const newMap = new Map(prev);
      newMap.delete(deviceChipId);
      return newMap;
    });

    if (activeDeviceId === deviceChipId) {
      setActiveDeviceId(null);
    }
  }, [activeDeviceId]);

  // Limpar todos os rastreamentos
  const clearAll = useCallback(() => {
    setTrackedDevices(new Map());
    setActiveDeviceId(null);
  }, []);

  // Obter lista de dispositivos rastreados
  const getTrackedDevicesList = useCallback(() => {
    return Array.from(trackedDevices.values());
  }, [trackedDevices]);

  // Verificar se um dispositivo está sendo rastreado
  const isDeviceTracked = useCallback((deviceChipId) => {
    return trackedDevices.has(deviceChipId) && trackedDevices.get(deviceChipId).isActive;
  }, [trackedDevices]);

  const value = {
    trackedDevices,
    activeDeviceId,
    setActiveDeviceId,
    startTracking,
    stopTracking,
    removeDevice,
    clearAll,
    getTrackedDevicesList,
    isDeviceTracked,
  };

  return (
    <GpsTrackingContext.Provider value={value}>
      {children}
    </GpsTrackingContext.Provider>
  );
};

/**
 * Hook para acessar o contexto de rastreamento GPS
 */
export const useGpsTracking = () => {
  const context = useContext(GpsTrackingContext);
  if (!context) {
    throw new Error("useGpsTracking deve ser usado dentro de GpsTrackingProvider");
  }
  return context;
};

/**
 * Hook combinado para rastrear um dispositivo específico
 */
export const useTrackedDevice = (deviceChipId, autoStart = false) => {
  const { startTracking, stopTracking, isDeviceTracked } = useGpsTracking();

  const gpsData = useGpsData(deviceChipId, {
    enableTracking: isDeviceTracked(deviceChipId),
    maxTrackPoints: 5000,
  });

  const startDeviceTracking = useCallback(() => {
    return startTracking(deviceChipId);
  }, [deviceChipId, startTracking]);

  const stopDeviceTracking = useCallback(() => {
    stopTracking(deviceChipId);
  }, [deviceChipId, stopTracking]);

  // Auto-iniciar se solicitado
  React.useEffect(() => {
    if (autoStart && deviceChipId) {
      startDeviceTracking();
    }
  }, [autoStart, deviceChipId, startDeviceTracking]);

  return {
    ...gpsData,
    isTracking: isDeviceTracked(deviceChipId),
    startTracking: startDeviceTracking,
    stopTracking: stopDeviceTracking,
  };
};
