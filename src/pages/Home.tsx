import PingButton from '../components/pingbutton'
import '../index.css'
import { Button } from "@/components/ui/button"
import {Card, CardHeader} from "@/components/ui/card"

import { useEffect, useState } from 'react'                     
import { useOutletContext } from 'react-router-dom'             
import type { MapContext } from '../layouts/maplayout.tsx'   

import PlaceSearch, { type Place } from '../components/placesearch'                  
type Stop = { id: string; place: Place | null }



function Home() {
  const { setPlaces } = useOutletContext<MapContext>()    

  const [from, setFrom] = useState<Place | null>(null)
  const [to, setTo] = useState<Place | null>(null)
  const [stops, setStops] = useState<Stop[]>([])

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
  }, [from, to, stops, setPlaces])

  
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
      <div className='pointer-events-auto'>
         <PingButton />
      </div>
      </Card>
   </>
  )
}


export default Home
