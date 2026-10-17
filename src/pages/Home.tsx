import '../index.css'

function App() {

  return (
    <div>
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <div className="size-90 h-screen absolute bottom-0 bg-blue">

        <div className='m-5 flex-row'>
            <div>
                <p className='text-white font-bold'>From</p>
                <input type='text' className='w-80 h-10 mx-1 outline-none bg-white p-2 text-black rounded-xl overflow-hidden'></input>
            </div>
              <div>
                <p className='text-white font-bold'>To</p>
                <input type='text' className='w-80 max-w-md h-10 mx-1 outline-none bg-white p-2 text-black rounded-xl overflow-hidden'></input>
            </div>
           
        </div>
       
      </div>
    </div>
  )
}

export default App
