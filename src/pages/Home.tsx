import PingButton from '../components/pingbutton'
import '../index.css'
import { Button } from "@/components/ui/button"
import {Card, CardHeader} from "@/components/ui/card"

import { useState } from 'react'
import PlaceSearch, { type Place } from '../components/placesearch'
import Map from '../components/map.tsx'

function Home() {
  type Stop = { id: string; place: Place | null }

    const [from, setFrom] = useState<Place | null>(null)
  const [to, setTo] = useState<Place | null>(null)
  const [stops, setStops] = useState<Stop[]>([])

  const addStop = () =>
    setStops(prev => [...prev, { id: crypto.randomUUID(), place: null }])

  const updateStop = (id: string, place: Place | null) =>
    setStops(prev => prev.map(s => (s.id === id ? { ...s, place } : s)))

  const removeStop = (id: string) =>
    setStops(prev => prev.filter(s => s.id !== id))

  // every selected place in route order: from, stops..., to
  const places = [from, ...stops.map(s => s.place), to].filter(
    (p): p is Place => p !== null
  )
  
  return (
    <div>
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <div className='absolute inset-0 z-0'>
          <Map places={places} />
      </div>

      <Card className="size-90 h-screen absolute p-5 bottom-0 bg-blue overflow-y-auto">
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
      </Card>
      <PingButton />
    </div>
  )
}


export default Home
