import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
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

export default function TransitMap() {
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
      <Marker position={[43.6532, -79.3832]} icon={pinIcon}>
        <Popup>Downtown Toronto</Popup>
      </Marker>
    </MapContainer>
  );
}