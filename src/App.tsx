import { BrowserRouter, Routes, Route } from 'react-router-dom';

import Home from "./pages/Home.tsx";
import MapLayout from "./layouts/maplayout.tsx";
import Stops from "./pages/StopView.tsx";
import AltRoute from "./pages/AlternativeRoute.tsx";


const App = () => {
    return (
        <BrowserRouter>
            <Routes>
                <Route element={<MapLayout />}>
                    <Route path="/" element={<Home />} />
                    <Route path="/stops" element={<Stops />} />
                    <Route path="/altroute" element={<AltRoute />} />
                </Route>
                <Route path="/map" element={null} /> 
            </Routes>
        </BrowserRouter>
    )
}

export default App;