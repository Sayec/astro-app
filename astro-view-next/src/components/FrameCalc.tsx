'use client';

import { useState, useEffect } from 'react';
import { fetchSky, SkyData } from '@/api';
import { Location } from './LocationPicker';
import './FrameCalc.css';

function parseDarkWindow(start: string, end: string): number {
    // start = "20:55", end = "03:29" — calculate minutes between them
    const [sh, sm] = start.split(':').map(Number);
    const [eh, em] = end.split(':').map(Number);
    let startMin = sh * 60 + sm;
    let endMin = eh * 60 + em;
    if (endMin <= startMin) endMin += 24 * 60; // crosses midnight
    return endMin - startMin;
}

function formatDuration(totalMinutes: number): string {
    const h = Math.floor(totalMinutes / 60);
    const m = Math.round(totalMinutes % 60);
    if (h === 0) return `${m}min`;
    return `${h}h ${m}min`;
}

export default function FrameCalc({ location }: { location: Location }) {
    const [skyData, setSkyData] = useState<SkyData | null>(null);
    const [loading, setLoading] = useState(true);
    const [exposureSec, setExposureSec] = useState(30);
    const [ditheringSec, setDitheringSec] = useState(10);

    useEffect(() => {
        setLoading(true);
        fetchSky(location.lat, location.lon)
            .then(res => { setSkyData(res); setLoading(false); })
            .catch(() => setLoading(false));
    }, [location]);

    if (loading) return <div className="module-card loading">⏳ Ładowanie...</div>;
    if (!skyData) return null;

    const darkMinutes = parseDarkWindow(skyData.darkHoursStart, skyData.darkHoursEnd);
    const cycleSeconds = exposureSec + ditheringSec;
    const totalFrames = cycleSeconds > 0 ? Math.floor((darkMinutes * 60) / cycleSeconds) : 0;
    const totalExposureMin = (totalFrames * exposureSec) / 60;
    const usedPercent = cycleSeconds > 0
        ? Math.min(100, Math.round((totalFrames * cycleSeconds) / (darkMinutes * 60) * 100))
        : 0;

    return (
        <div className="module-card frame-calc">
            <div className="module-header">
                <h2>📷 Kalkulator klatek</h2>
                <span className="module-subtitle">
                    Ciemne niebo: {skyData.darkHoursStart} – {skyData.darkHoursEnd} ({formatDuration(darkMinutes)})
                </span>
            </div>

            <div className="frame-calc-body">
                <div className="fc-inputs">
                    <div className="fc-field">
                        <label htmlFor="fc-exposure">Ekspozycja (s)</label>
                        <input
                            id="fc-exposure"
                            type="number"
                            min={1}
                            max={3600}
                            value={exposureSec}
                            onChange={e => setExposureSec(Math.max(1, Number(e.target.value)))}
                        />
                    </div>
                    <div className="fc-field">
                        <label htmlFor="fc-dithering">Dithering (s)</label>
                        <input
                            id="fc-dithering"
                            type="number"
                            min={0}
                            max={300}
                            value={ditheringSec}
                            onChange={e => setDitheringSec(Math.max(0, Number(e.target.value)))}
                        />
                    </div>
                </div>

                <div className="fc-results">
                    <div className="fc-result-card fc-primary">
                        <span className="fc-result-value">{totalFrames}</span>
                        <span className="fc-result-label">klatek</span>
                    </div>
                    <div className="fc-result-card">
                        <span className="fc-result-value">{formatDuration(totalExposureMin)}</span>
                        <span className="fc-result-label">łączna ekspozycja</span>
                    </div>
                    <div className="fc-result-card">
                        <span className="fc-result-value">{usedPercent}%</span>
                        <span className="fc-result-label">okna ciemnego nieba</span>
                    </div>
                </div>

                {/* Progress bar */}
                <div className="fc-progress-track">
                    <div
                        className="fc-progress-bar"
                        style={{ width: `${usedPercent}%` }}
                    />
                </div>
            </div>
        </div>
    );
}
