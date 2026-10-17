import PingButton from '../components/pingbutton'
import '../index.css'
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {Card, CardHeader} from "@/components/ui/card"

import Map from '../components/map.tsx'
function App() {

  return (
    <div>
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <div className='absolute inset-0 z-0'>
          <Map />
      </div>

      <Card className="size-90 h-screen absolute p-5 bottom-0 bg-blue">
        <div >
        <CardHeader className='text-white font-bold'>FROM</CardHeader>
        <Input className='mx-1 outline-none bg-white p-2 text-black rounded-xl overflow-hidden' />

        <CardHeader className='text-white font-bold'>TO</CardHeader>
        <Input className='mx-1 outline-none bg-white p-2 text-black rounded-xl overflow-hidden' />
        </div>
        <Button className='bg-white text-black hover:bg-amber-200'>+ ADD STOP</Button>

      </Card>
      <PingButton />
    </div>
  )
}

export default App
