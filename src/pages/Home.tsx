import '../index.css'
import { Input } from "@/components/ui/input"

import { Button } from "@/components/ui/button"

function App() {

  return (
    <div>
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <div className="size-90 h-screen absolute bottom-0 bg-blue">

        <div className='p-3 grid grid-col gap-6'>
            <div>

                <p className='text-white pl-2'>FROM</p>
                <Input className='h-10 mx-1 outline-none bg-white p-2 text-black rounded-xl overflow-hidden' />
            </div>
            <div>
                <p className='text-white pl-2'>TO</p>
                <Input className='h-10 mx-1 outline-none bg-white p-2 text-black rounded-xl overflow-hidden' />
            </div>

            <Button className='bg-white text-black'>+ ADD STOP</Button>
            
        </div>
       
      </div>
    </div>
  )
}

export default App
