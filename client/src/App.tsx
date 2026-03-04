import AstroWeather from './components/AstroWeather';
import TonightSky from './components/TonightSky';
import NasaApod from './components/NasaApod';
import Satellites from './components/Satellites';
import Gallery from './components/Gallery';

export default function App() {
    return (
        <div className="app-container">
            <header className="app-header">
                <h1 className="app-title">
                    <span className="app-title-icon">🔭</span>
                    AstroView
                </h1>
                <p className="app-subtitle">Twój osobisty dashboard astronomiczny</p>
                <p className="app-location">📍 Warszawa (52.23°N, 21.01°E)</p>
            </header>

            <div className="dashboard-grid">
                {/* Row 1: Weather + Tonight's sky */}
                <AstroWeather />
                <TonightSky />

                {/* Row 2: NASA APOD (full width) */}
                <div className="full-width">
                    <NasaApod />
                </div>

                {/* Row 3: Satellites + Gallery */}
                <Satellites />

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
