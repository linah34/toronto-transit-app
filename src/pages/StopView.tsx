import '../index.css'
import { Button } from "@/components/ui/button"
import {Card, CardHeader} from "@/components/ui/card"
import Map from '../components/map.tsx'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faUser, faBus, faClock} from '@fortawesome/free-solid-svg-icons'

function StopView() {
  return (
    <div>
        <div className='absolute inset-0 z-0'>
                  <Map />
              </div>
      <Card className="size-90 h-screen absolute p-5 bottom-0 bg-blue"> 
        <CardHeader className='text-white font-bold text-center text-2xl'>BUS NAME</CardHeader>
        <div className='flex flex-row gap-25 align-middle'>
            <div className='flex flex-row gap-2'>
                <FontAwesomeIcon icon={faUser}className='text-white' size='lg'/>
                <p className='text-white'>occupancy:</p>
            </div>
            
            <div className='flex flex-row gap-2'>
                <FontAwesomeIcon icon={faBus}className='text-white' size='lg'/>
                <p className='text-white'>delay time:</p>
            </div>
        </div>

        <div className='flex flex-row gap-35'>
            <p className='text-white overflow-hidden'>abc street</p>
            <div className='flex flex-row gap-5'>
                <div className='flex flex-row gap-2'>
                    <FontAwesomeIcon icon={faClock}className='text-white' size='lg'/>
                    <p className='text-white'>time</p>
                </div>
                <Button className='bg-white text-blue outline' size='xs'>GO</Button>
            </div>
           
        </div>
    
      </Card>
    </div>
  )
}

export default StopView
