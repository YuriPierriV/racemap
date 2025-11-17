import { useEffect } from "react";
import { useMap } from "react-leaflet";

export default function RecenterMap({ center }) {
  const map = useMap();

  useEffect(() => {
    if (center && map) {
      map.setView(center, map.getZoom());
    }
  }, [center, map]);

  return null;
}
