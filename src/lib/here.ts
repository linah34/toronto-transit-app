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

export type Trip = {
  legs: Leg[]
  minutes: number
  departure?: string
  arrival?: string
}

function toLeg(s: any): Leg {
  let coords: [number, number][] = s.polyline
    ? (decode(s.polyline).polyline as number[][]).map(p => [p[0], p[1]] as [number, number])
    : []

  // fallback: straight line if HERE sent no shape for this leg
  if (coords.length < 2) {
    const a = s.departure?.place?.location
    const b = s.arrival?.place?.location
    if (a && b) coords = [[a.lat, a.lng], [b.lat, b.lng]]
  }

  return {
    mode: s.transport?.mode ?? s.type,
    line: s.transport?.name,
    headsign: s.transport?.headsign,
    coords,
    departure: s.departure?.time,
    arrival: s.arrival?.time,
    minutes: s.travelSummary ? Math.round(s.travelSummary.duration / 60) : undefined,
    delaySeconds: s.departure?.delay,
  }
}

const MODES = 'subway,bus,lightRail'

async function routeBetween(a: Place, b: Place): Promise<Leg[][]> {
  const url =
    `https://transit.router.hereapi.com/v8/routes` +
    `?origin=${a.lat},${a.lng}&destination=${b.lat},${b.lng}` +
    `&modes=${MODES}` + 
    `&alternatives=2` +   //num of alt options
    `&return=polyline,travelSummary,incidents` +
    `&apiKey=${KEY}`

  const res = await fetch(url)
  if (!res.ok) throw new Error(`HERE error ${res.status}: ${await res.text()}`)
  const data = await res.json()
  return (data.routes ?? []).map((r: any) => r.sections.map(toLeg))
}

export async function getTrips(places: Place[]): Promise<Trip[]> {
  const perPair = await Promise.all(
    places.slice(1).map((p, i) => routeBetween(places[i], p))
  )
  if (perPair.length === 0 || perPair.some(options => options.length === 0)) return []

  const count = Math.max(...perPair.map(options => options.length))

  return Array.from({ length: count }, (_, k) => {
    // option k of each pair (or the best one if a pair has fewer options)
    const legs = perPair.flatMap(options => options[k] ?? options[0])
    const departure = legs[0]?.departure
    const arrival = legs[legs.length - 1]?.arrival
    const minutes =
      departure && arrival
        ? Math.round((new Date(arrival).getTime() - new Date(departure).getTime()) / 60000)
        : legs.reduce((sum, l) => sum + (l.minutes ?? 0), 0)
    return { legs, minutes, departure, arrival }
  })
}