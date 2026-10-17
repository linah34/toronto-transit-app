import { BrowserRouter, Routes, Route } from 'react-router-dom';

import Home from "./pages/Home.tsx";
import Map from "./components/map.tsx";

const App = () => {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/map" element={<Map />} />
            </Routes>
        </BrowserRouter>
    )
}

export default App;