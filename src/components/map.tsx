import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { icon } from '@fortawesome/fontawesome-svg-core'
import { faLocationPin } from '@fortawesome/free-solid-svg-icons'
import { useEffect } from "react";
import StopsLayer from "./stopslayer";

import type { Place } from "./placesearch";

const pinSVG = icon(faLocationPin).html[0]

const pinIcon = L.divIcon({
  html: `<span class="block h-10 w-8 text-blue-600 drop-shadow-md [&>svg]:h-full [&>svg]:w-full">${pinSVG}</span>`,
  className: '',          
  iconSize: [32, 40],
  iconAnchor: [16, 40],   
  popupAnchor: [0, -40],
})

//helper component that moves the map to the selected places.
function FitToPlaces({ places }: { places: Place[] }) {
  const map = useMap();
  useEffect(() => {
    if (places.length === 0) return;
    if (places.length === 1) {
      map.flyTo([places[0].lat, places[0].lng], 15); // one place: zoom to it
    } else {
      map.fitBounds(places.map((p) => [p.lat, p.lng] as [number, number]), {
        padding: [60, 60], // several places: zoom out so all are visible
      });
    }
  }, [places, map]);
  return null;
}

type Props = { places: Place[] }; 



export default function TransitMap({places}: Props) {
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

      <FitToPlaces places={places} />
      <StopsLayer />

      {places.map((p, i) => (
        <Marker key={i} position={[p.lat, p.lng]} icon={pinIcon}>
          <Popup>{p.name}</Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}