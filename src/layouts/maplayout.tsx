import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import Map from '../components/map'
import type { Place } from '../components/placesearch'
import type { Leg } from '../lib/here'     

export type MapContext = {
  setPlaces: (places: Place[]) => void
   setRoute: (route: Leg[]) => void   
}

export default function MapLayout() {
  const [places, setPlaces] = useState<Place[]>([])
   const [route, setRoute] = useState<Leg[]>([])  

  return (
    <div className="relative h-screen w-screen overflow-hidden">
      <div className="absolute inset-0 z-0">
        <Map places={places} route={route} />
      </div>
      
      <div className="pointer-events-none absolute inset-0 z-10">
        <Outlet context={{ setPlaces, setRoute } satisfies MapContext} /> 
      </div>
    </div>
  )
}