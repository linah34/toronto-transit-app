import { useCallback, useEffect, useRef, useState } from "react";
import { CircleMarker, Popup, useMap, useMapEvents } from "react-leaflet";
import { supabase } from "../lib/supabase";
import StopDepartures from "./StopDepartures";

export type Stop = {
  id: string;
  name: string;
  lat: number;
  lng: number;
  routes: string[];
};

const MIN_ZOOM = 15; // below this the area is too big to show every stop

export default function StopsLayer() {
  const map = useMap();
  const [stops, setStops] = useState<Stop[]>([]);
  const [message, setMessage] = useState("");
  const timer = useRef<number | undefined>(undefined);
  const requestId = useRef(0);

  const load = useCallback(async () => {
    if (map.getZoom() < MIN_ZOOM) {
      requestId.current++; // invalidate any in-flight request
      setStops([]);
      setMessage("Zoom in to see transit stops");
      return;
    }

    const b = map.getBounds();
    const bbox = [b.getWest(), b.getSouth(), b.getEast(), b.getNorth()];
    const id = ++requestId.current;
    setMessage("");

    const { data, error } = await supabase.functions.invoke("transit-stops", {
      body: { bbox },
    });
    if (id !== requestId.current) return; // a newer request replaced this one
    if (error) {
      setMessage("Couldn't load stops");
      return;
    }
    setStops(data.stops ?? []);
  }, [map]);

  // Reload (debounced) whenever the map stops moving or zooming
  useMapEvents({
    moveend: () => {
      window.clearTimeout(timer.current);
      timer.current = window.setTimeout(load, 400);
    },
  });

  // Initial load, and cleanup of any pending timer
  useEffect(() => {
    load();
    return () => window.clearTimeout(timer.current);
  }, [load]);

  return (
    <>
      {message && (
        <div className="leaflet-top leaflet-right">
          <div className="leaflet-control rounded-lg bg-white px-3 py-1 text-sm text-black shadow">
            {message}
          </div>
        </div>
      )}

      {stops.map((stop) => (
        <CircleMarker
          key={stop.id}
          center={[stop.lat, stop.lng]}
          radius={7}
          pathOptions={{ color: "#b91c1c", fillColor: "#ef4444", fillOpacity: 0.9 }}
        >
          {/* <Popup>
            <strong>{stop.name}</strong>
            <br />
            {stop.routes.length > 0
              ? `Routes: ${stop.routes.join(", ")}`
              : "No route info"}
          </Popup> */}
            <Popup minWidth={240}>
            <strong>{stop.name}</strong>
            <StopDepartures stopId={stop.id} />
          </Popup>
        </CircleMarker>
      ))}
    </>
  );
}