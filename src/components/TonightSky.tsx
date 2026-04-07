'use client';

import { useState, useEffect } from 'react';
import { fetchSky, SkyData } from '@/api';
import { Location } from './LocationPicker';
import './TonightSky.css';

export default function TonightSky({ location }: { location: Location }) {
    const [data, setData] = useState<SkyData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        setLoading(true);
        fetchSky(location.lat, location.lon)
            .then(res => { setData(res); setLoading(false); })
            .catch(err => { setError(err.message); setLoading(false); });
    }, [location]);

    if (loading) return <div className="module-card loading">⏳ Ładowanie danych o niebie...</div>;
    if (error) return <div className="module-card error">❌ {error}</div>;
    if (!data) return null;

    // Moon illumination determines how much shadow covers the moon disc
    const illum = data.moon.illumination;
    const isWaxing = data.moon.ageDays < 14.76;

    return (
        <div className="module-card tonight-sky">
            <div className="module-header">
                <h2>🌙 Dzisiejsze Niebo</h2>
                <span className="module-subtitle">{new Date().toLocaleDateString('pl-PL', { weekday: 'long', day: 'numeric', month: 'long' })}</span>
            </div>

            <div className="sky-content">
                {/* Moon visualization */}
                <div className="moon-section">
                    <div className="moon-disc">
                        <div className="moon-emoji">{data.moon.emoji}</div>
                    </div>
                    <div className="moon-info">
                        <div className="moon-phase-name">{data.moon.phase}</div>
                        <div className="moon-illumination">{illum}% oświetlenia</div>
                        <div className="moon-age">Dzień {data.moon.ageDays} cyklu</div>
                        <div className="moon-upcoming">
                            <div className="moon-event">
                                <span className="moon-event-icon">🌕</span>
                                <span className="moon-event-label">Pełnia</span>
                                <span className="moon-event-date">{data.moon.nextFullMoon}</span>
                                <span className="moon-event-days">
                                    {data.moon.daysToFullMoon === 0 ? 'dziś!' : `za ${data.moon.daysToFullMoon} dn.`}
                                </span>
                            </div>
                            <div className="moon-event">
                                <span className="moon-event-icon">🌑</span>
                                <span className="moon-event-label">Nów</span>
                                <span className="moon-event-date">{data.moon.nextNewMoon}</span>
                                <span className="moon-event-days">
                                    {data.moon.daysToNewMoon === 0 ? 'dziś!' : `za ${data.moon.daysToNewMoon} dn.`}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Sun & Dark times */}
                <div className="times-grid">
                    <div className="time-item">
                        <span className="time-icon">🌅</span>
                        <span className="time-label">Wschód</span>
                        <span className="time-value">{data.sunrise}</span>
                    </div>
                    <div className="time-item">
                        <span className="time-icon">🌇</span>
                        <span className="time-label">Zachód</span>
                        <span className="time-value">{data.sunset}</span>
                    </div>
                    <div className="time-item">
                        <span className="time-icon">☀️</span>
                        <span className="time-label">Długość dnia</span>
                        <span className="time-value">{data.dayLengthHours}h</span>
                    </div>
                    <div className="time-item highlight">
                        <span className="time-icon">🔭</span>
                        <span className="time-label">Ciemne niebo</span>
                        <span className="time-value">{data.darkHoursStart} – {data.darkHoursEnd}</span>
                    </div>
                </div>

                {/* Observation quality hint */}
                <div className={`obs-quality ${illum <= 30 ? 'great' : illum <= 60 ? 'ok' : 'bad'}`}>
                    {illum <= 30 && '🟢 Świetna noc na deep-sky! Mało światła Księżyca.'}
                    {illum > 30 && illum <= 60 && '🟡 Dobra noc na jasne obiekty i planety.'}
                    {illum > 60 && '🔴 Dużo poświaty Księżyca – trudne warunki dla mgławic.'}
                </div>
            </div>
        </div>
    );
}
