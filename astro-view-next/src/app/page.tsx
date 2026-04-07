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
import LocationPicker, { Location } from '@/components/LocationPicker';

const DEFAULT_LOCATION: Location = { lat: 52.23, lon: 21.01, name: 'Warszawa' };

export default function Home() {
    const [location, setLocation] = useState<Location>(DEFAULT_LOCATION);

    return (
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
                {/* Row 1: Weather + Tonight's sky + Frame calc */}
                <AstroWeather location={location} />
                <TonightSky location={location} />
                <FrameCalc location={location} />

                {/* Row 2: Top objects for tonight (full width) */}
                <div className="full-width">
                    <TopObjects location={location} />
                </div>

                {/* Row 3: NASA APOD (full width) */}
                <div className="full-width">
                    <NasaApod />
                </div>

                {/* Row 3: Satellites + Object Search */}
                <Satellites location={location} />
                <ObjectSearch location={location} />

                <div className="full-width">
                    <Gallery />
                </div>
            </div>

            <footer className="app-footer">
                AstroView © {new Date().getFullYear()} • Dane: 7Timer!, NASA, Open-Meteo, N2YO
            </footer>
        </div>
    );
}
