import { decode } from '@here/flexpolyline'
import type { Place } from '../components/placesearch'

const KEY = import.meta.env.VITE_HERE_API_KEY as string

export type Leg = {
  mode: string                  
  line?: string                 
  headsign?: string             
  coords: [number, number][]    
  departure?: string
  arrival?: string
  minutes?: number 
  delaySeconds?: number             
}

const MODES = 'subway,bus,lightRail'

async function routeBetween(a: Place, b: Place): Promise<Leg[]> {
  const url =
    `https://transit.router.hereapi.com/v8/routes` +
    `?origin=${a.lat},${a.lng}&destination=${b.lat},${b.lng}` +
    `&modes=${MODES}` + 
    `&return=polyline,travelSummary,incidents` +
    `&apiKey=${KEY}`

  const res = await fetch(url)
  if (!res.ok) throw new Error(`HERE error ${res.status}: ${await res.text()}`)
  const data = await res.json()

  //temp
  console.log('HERE raw response:', data)
  console.table(
    data.routes?.[0]?.sections.map((s: any) => ({
      type: s.type,
      mode: s.transport?.mode,
      line: s.transport?.name,
      departs: s.departure?.time,
      depDelay: s.departure?.delay,
    }))
  )

  const route = data.routes?.[0]
  if (!route) return []

  return route.sections.map((s: any) => ({
    mode: s.transport?.mode ?? s.type,
    line: s.transport?.name,
    headsign: s.transport?.headsign,
    coords: s.polyline ? (decode(s.polyline).polyline as [number, number][]) : [],
    departure: s.departure?.time,
    arrival: s.arrival?.time,
    minutes: s.travelSummary ? Math.round(s.travelSummary.duration / 60) : undefined,
    delaySeconds: s.departure?.delay,  
  }))
}

export async function getRoute(places: Place[]): Promise<Leg[]> {
  const pairs = places.slice(1).map((p, i) => routeBetween(places[i], p))
  return (await Promise.all(pairs)).flat()
}