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
import Equipment from '@/components/Equipment';

const DEFAULT_LOCATION: Location = { lat: 52.23, lon: 21.01, name: 'Warszawa' };

export default function Home() {
    const [location, setLocation] = useState<Location>(DEFAULT_LOCATION);

    return (
        <>
            <nav className="app-nav">
                <div className="nav-container">
                    <a href="#" onClick={(e) => { e.preventDefault(); window.scrollTo({ top: 0, behavior: 'smooth' }); }} className="nav-logo-link">
                        <img src="/logo.png" alt="AstroView" className="nav-logo" />
                    </a>
                    <ul>
                        <li><a href="#weather">Pogoda</a></li>
                        <li><a href="#tonight">Dzisiejszej Nocy</a></li>
                        <li><a href="#framecalc">Kalkulator Klatek</a></li>
                        <li><a href="#topobjects">Top Obiekty</a></li>
                        <li><a href="#apod">APOD</a></li>
                        <li><a href="#satellites">Satelity</a></li>
                        <li><a href="#search">Szukaj</a></li>
                        <li><a href="#equipment">Sprzęt</a></li>
                        <li><a href="#gallery">Galeria</a></li>
                    </ul>
                    <div className="nav-spacer"></div>
                </div>
            </nav>
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
                <div id="weather"><AstroWeather location={location} /></div>
                <div id="tonight"><TonightSky location={location} /></div>
                <div id="framecalc"><FrameCalc location={location} /></div>

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
