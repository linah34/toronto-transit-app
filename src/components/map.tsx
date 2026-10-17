import "leaflet/dist/leaflet.css";
import L from "leaflet";

import { useEffect } from "react";
import type { Place } from "./PlaceSearch";

import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import { icon } from '@fortawesome/fontawesome-svg-core'
import { faLocationPin } from '@fortawesome/free-solid-svg-icons'

const pinSVG = icon(faLocationPin).html[0]

const pinIcon = L.divIcon({
  html: `
    <div class="flex h-8 w-8 items-center justify-center rounded-full text-blue ">
      <span class="h-4 w-4">${pinSVG}</span>
    </div>
  `,
  className: '',          
  iconSize: [64, 64],
  iconAnchor: [16, 16],   
  popupAnchor: [0, -16],
})

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
      <Marker position={[43.6532, -79.3832]}>
        <Popup>Downtown Toronto</Popup>
      </Marker> */
      )}
    </MapContainer>
  );
}

// Powered by <a href="https://www.geoapify.com/">Geoapify</a>
