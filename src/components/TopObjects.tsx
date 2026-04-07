'use client';

import { useState, useEffect } from 'react';
import { fetchTopObjects } from '@/api';
import type { TopObjectItem } from '@/types';
import { Location } from './LocationPicker';
import './TopObjects.css';

function Stars({ count }: { count: number }) {
    return (
        <span className="star-rating" aria-label={`${count} z 5 gwiazdek`}>
            {Array.from({ length: 5 }, (_, i) => (
                <span key={i} className={`star ${i < count ? 'filled' : 'empty'}`}>★</span>
            ))}
        </span>
    );
}

function ratingClass(r: number): string {
    if (r >= 4) return 'rating-great';
    if (r >= 3) return 'rating-good';
    return 'rating-fair';
}

export default function TopObjects({ location }: { location: Location }) {
    const [objects, setObjects] = useState<TopObjectItem[]>([]);
    const [moonIllum, setMoonIllum] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        setLoading(true);
        fetchTopObjects(location.lat, location.lon)
            .then(res => {
                setObjects(res.objects);
                setMoonIllum(res.moonIllumination);
                setLoading(false);
            })
            .catch(err => { setError(err.message); setLoading(false); });
    }, [location]);

    if (loading) return <div className="module-card loading">⏳ Szukam najlepszych obiektów na dziś...</div>;
    if (error) return <div className="module-card error">❌ {error}</div>;
    if (objects.length === 0) return null;

    return (
        <div className="module-card top-objects">
            <div className="module-header">
                <h2>🏆 Top obiekty na dziś wieczór</h2>
                <span className="module-subtitle">
                    Księżyc {moonIllum}% • Ranking dla Twojej lokalizacji
                </span>
            </div>

            <div className="top-objects-grid">
                {objects.map(obj => (
                    <div key={obj.id} className={`top-object-card ${ratingClass(obj.rating)}`}>
                        <div className="top-object-header">
                            <span className="top-object-emoji">{obj.emoji}</span>
                            <div className="top-object-id-info">
                                <span className="top-object-id">{obj.id}</span>
                                <span className="top-object-type">{obj.type}</span>
                            </div>
                        </div>
                        <div className="top-object-name">{obj.name}</div>
                        <Stars count={obj.rating} />
                        <div className="top-object-reason">{obj.reason}</div>
                        <div className="top-object-meta">
                            {obj.isAboveHorizon
                                ? <span className="meta-above">▲ {obj.currentAltitude}° nad horyzontem</span>
                                : <span className="meta-below">▼ pod horyzontem (maks. {obj.maxAltitude}°)</span>
                            }
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
