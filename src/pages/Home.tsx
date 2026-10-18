import PingButton from '../components/pingbutton'
import '../index.css'
import { Button } from "@/components/ui/button"
import {Card, CardHeader} from "@/components/ui/card"
import { useEffect, useState } from 'react'                     
import { useOutletContext } from 'react-router-dom'             
import type { MapContext } from '../layouts/maplayout.tsx'   
import PlaceSearch, { type Place } from '../components/placesearch'                  
import { getTrips, type Trip, type Leg} from '../lib/here' 

type Stop = { id: string; place: Place | null }
function Home() {
  const { setPlaces, setRoute } = useOutletContext<MapContext>()    

  const [from, setFrom] = useState<Place | null>(null)
  const [to, setTo] = useState<Place | null>(null)
  const [stops, setStops] = useState<Stop[]>([])

  const [trips, setTrips] = useState<Trip[]>([])                
  const [selected, setSelected] = useState(0)                     
  const [loading, setLoading] = useState(false)                   
  const [error, setError] = useState('')         

  const addStop = () =>
    setStops(prev => [...prev, { id: crypto.randomUUID(), place: null }])

  const updateStop = (id: string, place: Place | null) =>
    setStops(prev => prev.map(s => (s.id === id ? { ...s, place } : s)))

  const removeStop = (id: string) =>
    setStops(prev => prev.filter(s => s.id !== id))
useEffect(() => {
  const all = [from, ...stops.map(s => s.place), to].filter(
    (p): p is Place => p !== null
  )
  setPlaces(all)

  if (all.length < 2) {
    setRoute([]); setTrips([]); setError('')
    return
  }

  let cancelled = false                       // ignore stale responses
  setLoading(true)
  setError('')

  getTrips(all)
    .then(t => {
      if (cancelled) return
      setTrips(t)
      setSelected(0)
      setRoute(t[0]?.legs ?? [])              // draw the best option first
      if (t.length === 0) setError('No transit route found')
    })
    .catch(e => {
      if (cancelled) return
      console.error('getTrips failed:', e)
      setError('Could not load routes')
    })
    .finally(() => { if (!cancelled) setLoading(false) })

  return () => { cancelled = true }
}, [from, to, stops, setPlaces, setRoute])

const chooseTrip = (i: number) => {
  setSelected(i)
  setRoute(trips[i].legs)
}

const time = (iso?: string) =>
  iso ? new Date(iso).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }) : ''

const modeName = (leg: Leg) =>
  leg.mode === 'subway' ? `Line ${leg.line ?? ''}`
  : leg.mode === 'lightRail' ? `Streetcar ${leg.line ?? ''}`
  : `Bus ${leg.line ?? ''}`

  return (
    <>
      <Card className="pointer-events-auto w-90 absolute p-5 top-0 h-screen bg-blue overflow-y-auto rounded-none ">
        <CardHeader className='text-white font-bold text-center text-3xl'>Move Better</CardHeader>
        <div className='flex flex-col gap-4'>
          <div>
            <CardHeader className='text-white font-bold'>FROM</CardHeader>
            <PlaceSearch  placeholder="Search a place" onSelect={setFrom} />
          </div>

          {stops.map((stop, i) => (
            <div key={stop.id}>
              <CardHeader className='text-white font-bold flex justify-between'>
                STOP {i + 1}
                <button onClick={() => removeStop(stop.id)} className='text-white/70 hover:text-white'>
                  ✕
                </button>
              </CardHeader>
              <PlaceSearch
                placeholder="Search a place"
                onSelect={(p) => updateStop(stop.id, p)}
              />
            </div>
          ))}

          <div>
            <CardHeader className='text-white font-bold'>TO</CardHeader>
            <PlaceSearch  placeholder="Search a place" onSelect={setTo} />
          </div>
        </div>
        
      <Button onClick={addStop} className='bg-white text-blue hover:bg-amber-200 rounded-2xl'>+ ADD STOP</Button>
      {loading && <p className="mt-4 text-white">Finding routes...</p>}
{error && <p className="mt-4 text-amber-200">{error}</p>}

<div className="mt-4 flex flex-col gap-3">
  {trips.map((trip, i) => (
    <button
      key={i}
      onClick={() => chooseTrip(i)}
      className={`rounded-xl border p-3 text-left ${
        i === selected
          ? 'border-white bg-white text-blue-600'
          : 'border-white/40 text-white hover:bg-white/10'
      }`}
    >
      <div className="flex justify-between font-bold">
        <span>{trip.minutes} min</span>
        <span>{time(trip.departure)} - {time(trip.arrival)}</span>
      </div>
      <div className="mt-1 text-sm">
        {trip.legs
          .filter(l => l.mode !== 'pedestrian')
          .map(modeName)
          .join(' → ') || 'Walk only'}
      </div>
    </button>
  ))}
</div>

      <div className='pointer-events-auto'>
         <PingButton />
      </div>
      </Card>
   </>
  )
}


export default Home
