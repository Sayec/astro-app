import { useState, useEffect } from 'react';
import { fetchSatellites, SatellitePass } from '../api';
import './Satellites.css';

function formatUTC(utc: number): string {
    const d = new Date(utc * 1000);
    return d.toLocaleString('pl-PL', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' });
}

function isSoon(utc: number): boolean {
    const now = Date.now() / 1000;
    return utc > now && utc - now < 3600; // within 1 hour
}

function getMagClass(mag: number): string {
    if (mag <= -2) return 'very-bright';
    if (mag <= 0) return 'bright';
    if (mag <= 2) return 'visible';
    return 'dim';
}

export default function Satellites() {
    const [passes, setPasses] = useState<SatellitePass[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchSatellites()
            .then(res => { setPasses(res.passes); setLoading(false); })
            .catch(err => { setError(err.message); setLoading(false); });
    }, []);

    if (loading) return <div className="module-card loading">⏳ Ładowanie przelotów satelitów...</div>;
    if (error) return <div className="module-card error">❌ {error}</div>;

    return (
        <div className="module-card satellites">
            <div className="module-header">
                <h2>🛰️ Widoczne Satelity</h2>
                <span className="module-subtitle">{passes.length} przelotów w najbliższych dniach</span>
            </div>

            {passes.length === 0 ? (
                <div className="no-passes">Brak widocznych przelotów w najbliższych dniach 😔</div>
            ) : (
                <div className="passes-list">
                    {passes.map((pass, i) => (
                        <div key={i} className={`pass-row ${isSoon(pass.startUTC) ? 'soon' : ''}`}>
                            <div className="pass-sat">
                                <span className="sat-icon">{pass.satname === 'ISS' ? '🏠' : pass.satname === 'Hubble' ? '🔭' : '🛰️'}</span>
                                <span className="sat-name">{pass.satname}</span>
                                {isSoon(pass.startUTC) && <span className="soon-badge">WKRÓTCE!</span>}
                            </div>
                            <div className="pass-details">
                                <div className="pass-time">
                                    <span className="detail-label">Start</span>
                                    <span className="detail-value">{formatUTC(pass.startUTC)}</span>
                                </div>
                                <div className="pass-direction">
                                    <span className="detail-label">Kierunek</span>
                                    <span className="detail-value">{pass.startAzCompass} → {pass.endAzCompass}</span>
                                </div>
                                <div className="pass-elevation">
                                    <span className="detail-label">Max wys.</span>
                                    <span className="detail-value">{pass.maxEl}°</span>
                                </div>
                                <div className="pass-duration">
                                    <span className="detail-label">Czas</span>
                                    <span className="detail-value">{pass.duration}s</span>
                                </div>
                                <div className={`pass-mag ${getMagClass(pass.mag)}`}>
                                    <span className="detail-label">Jasność</span>
                                    <span className="detail-value">{pass.mag.toFixed(1)} mag</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
