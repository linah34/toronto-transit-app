import "leaflet/dist/leaflet.css";
import L from "leaflet";

import { useEffect } from "react";
import type { Place } from "./PlaceSearch";

import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

function FlyTo({ place }: { place: Place | null }) {
  const map = useMap(); // only works inside <MapContainer>
  useEffect(() => {
    if (place) map.flyTo([place.lat, place.lng], 16);
  }, [place, map]);
  return null;
}

export default function TransitMap({ place }: { place: Place | null }) {
  return (
    <MapContainer
      center={[43.6532, -79.3832]} // Toronto
      zoom={13}
      style={{ height: "100%", width: "100%" }}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <FlyTo place={place} />
      {place && (
        <Marker position={[place.lat, place.lng]}>
          <Popup>
            <strong>{place.name}</strong>
            <br />
            {place.address}
          </Popup>
        </Marker>
      /* <Marker position={[43.6532, -79.3832]}>
        <Popup>Downtown Toronto</Popup>
      </Marker> */
      )}
    </MapContainer>
  );
}

// Powered by <a href="https://www.geoapify.com/">Geoapify</a>
