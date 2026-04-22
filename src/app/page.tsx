'use client';

import { useState } from 'react';
import AstroWeather from '@/components/AstroWeather';
import TonightSky from '@/components/TonightSky';
import NasaApod from '@/components/NasaApod';
import Satellites from '@/components/Satellites';
import Gallery from '@/components/Gallery';
import ObjectSearch from '@/components/ObjectSearch';
import TopObjects from '@/components/TopObjects';
import FrameCalc from '@/components/FrameCalc';
import Sidebar from '@/components/Sidebar';
import LocationPicker, { Location } from '@/components/LocationPicker';
import Equipment from '@/components/Equipment';
import SkyMap from '@/components/SkyMap';

const DEFAULT_LOCATION: Location = { lat: 51.20, lon: 19.93, name: 'Skotniki' };

export default function Home() {
    const [location, setLocation] = useState<Location>(DEFAULT_LOCATION);

    return (
        <>
            <Sidebar />
            <div className="app-container">
                <header className="app-header">
                    <h1 className="app-title">
                        <span className="app-title-icon">🔭</span>
                        AstroView
                    </h1>
                    <p className="app-subtitle">Twój osobisty dashboard astronomiczny</p>
                    <div className="app-location">
                        <LocationPicker location={location} onLocationChange={setLocation} />
                    </div>
                </header>

                <div className="dashboard-grid">
                    {/* Row 1/2: Weather + Tonight's sky + Frame calc + SkyMap */}
                    <div id="weather"><AstroWeather location={location} /></div>
                    <div id="tonight"><TonightSky location={location} /></div>
                    <div id="framecalc"><FrameCalc location={location} /></div>
                    <div id="skymap"><SkyMap location={location} /></div>

                    {/* Row 2: Top objects for tonight (full width) */}
                    <div id="topobjects" className="full-width">
                        <TopObjects location={location} />
                    </div>

                    {/* Row 3: NASA APOD (full width) */}
                    <div id="apod" className="full-width">
                        <NasaApod />
                    </div>

                    {/* Row 3: Satellites + Object Search */}
                    <div id="satellites"><Satellites location={location} /></div>
                    <div id="search"><ObjectSearch location={location} /></div>

                    <div id="equipment" className="full-width">
                        <Equipment />
                    </div>

                    <div id="gallery" className="full-width">
                        <Gallery />
                    </div>
                </div>

                <footer className="app-footer">
                    <img src="/logo.png" alt="AstroView" className="footer-logo" />
                    <div>AstroView © {new Date().getFullYear()} • Dane: 7Timer!, NASA, Open-Meteo, N2YO</div>
                </footer>
            </div>
        </>
    );
}
