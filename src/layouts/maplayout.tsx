import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import Map from '../components/map'
import type { Place } from '../components/placesearch'

//claude
export type MapContext = {
  setPlaces: (places: Place[]) => void
}

export default function MapLayout() {
  // The layout owns the places, because the map lives here
  const [places, setPlaces] = useState<Place[]>([])

  return (
    <div className="relative h-screen w-screen overflow-hidden">
      {/* Back layer: the map, always mounted */}
      <div className="absolute inset-0 z-0">
        <Map places={places} />
      </div>

      {/* Front layer: whichever page is active.
          pointer-events-none lets clicks pass through empty areas to the map.
          Each page's panels need pointer-events-auto to be clickable. */}
      <div className="pointer-events-none absolute inset-0 z-10">
        <Outlet context={{ setPlaces } satisfies MapContext} />
      </div>
    </div>
  )
}