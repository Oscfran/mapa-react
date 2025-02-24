import { createRoot } from "react-dom/client";
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import "./index.css";
import MapApi from "./components/MapView/Map.jsx";
import NoPage from './pages/NoPage.jsx';
import Layout from './pages/Layout.jsx';
import { StrictMode } from 'react'

createRoot(document.getElementById("root")).render(
    <StrictMode>
    <BrowserRouter>
      <Routes>
          <Route path="/" element={<Layout />}> 
              <Route index element={<MapApi />} />
              <Route path="*" element={<NoPage />} /> {/* Catch-all for unknown routes */}
          </Route>
      </Routes>
    </BrowserRouter>
  </StrictMode>,
);
