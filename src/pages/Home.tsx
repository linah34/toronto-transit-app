import PingButton from '../components/pingbutton'
import '../index.css'
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {Card, CardHeader} from "@/components/ui/card"

import { useState } from 'react'
import PlaceSearch, { type Place } from '../components/placesearch'
import Map from '../components/map.tsx'

function Home() {
  const [place, setPlace] = useState<Place | null>(null);


  return (
    <div>
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <div className='absolute inset-0 z-0'>
          <Map place={place} />
      </div>

      <Card className="size-90 h-screen absolute p-5 bottom-0 bg-blue">
        <CardHeader className='text-white font-bold text-center text-3xl'>Move Better</CardHeader>
        <div className='flex flex-col gap-4'>
          <div>
            <CardHeader className='text-white font-bold'>FROM</CardHeader>
        <PlaceSearch placeholder="Search a place" onSelect={setPlace} />

            <Input className='mx-1 outline-none bg-white p-2 text-black rounded-xl overflow-hidden' />
          </div>
          <div>
            <CardHeader className='text-white font-bold'>TO</CardHeader>
            <Input className='mx-1 outline-none bg-white p-2 text-black rounded-xl overflow-hidden' />
          </div>
        </div>
        <Button className='bg-white text-blue hover:bg-amber-200'>+ ADD STOP</Button>

      </Card>
      <PingButton />
    </div>
  )
}


export default Home
