'use client';

import { useState, useRef } from 'react';
import './LocationPicker.css';

export interface Location {
    lat: number;
    lon: number;
    name: string;
}

interface Props {
    location: Location;
    onLocationChange: (loc: Location) => void;
}

interface GeoResult {
    name: string;
    admin1?: string;
    country: string;
    latitude: number;
    longitude: number;
}

export default function LocationPicker({ location, onLocationChange }: Props) {
    const [open, setOpen] = useState(false);
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<GeoResult[]>([]);
    const [searching, setSearching] = useState(false);
    const [gpsLoading, setGpsLoading] = useState(false);
    const debounceRef = useRef<ReturnType<typeof setTimeout>>(null!);

    async function search(q: string) {
        if (q.length < 2) { setResults([]); return; }
        setSearching(true);
        try {
            const res = await fetch(
                `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(q)}&count=6&language=pl&format=json`
            );
            const data = await res.json();
            setResults(data.results || []);
        } catch {
            setResults([]);
        } finally {
            setSearching(false);
        }
    }

    function handleInput(e: React.ChangeEvent<HTMLInputElement>) {
        const q = e.target.value;
        setQuery(q);
        clearTimeout(debounceRef.current);
        debounceRef.current = setTimeout(() => search(q), 350);
    }

    function pick(r: GeoResult) {
        onLocationChange({
            lat: r.latitude,
            lon: r.longitude,
            name: [r.name, r.admin1, r.country].filter(Boolean).join(', '),
        });
        setOpen(false);
        setQuery('');
        setResults([]);
    }

    function useGPS() {
        if (!navigator.geolocation) return;
        setGpsLoading(true);
        navigator.geolocation.getCurrentPosition(
            async pos => {
                const { latitude, longitude } = pos.coords;
                // Reverse geocode with Open-Meteo (just pick nearby city name)
                let name = `${latitude.toFixed(2)}°N, ${longitude.toFixed(2)}°E`;
                try {
                    const res = await fetch(
                        `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json&accept-language=pl`
                    );
                    const data = await res.json();
                    name = data.address?.city || data.address?.town || data.address?.village || data.display_name || name;
                } catch { /* use coordinates */ }
                onLocationChange({ lat: latitude, lon: longitude, name });
                setGpsLoading(false);
                setOpen(false);
            },
            () => setGpsLoading(false),
            { timeout: 10000 }
        );
    }

    return (
        <div className="loc-picker">
            <button className="loc-trigger" onClick={() => setOpen(o => !o)} title="Zmień lokalizację">
                📍 {location.name}
            </button>

            {open && (
                <div className="loc-dropdown">
                    <div className="loc-search-row">
                        <input
                            className="loc-input"
                            type="text"
                            placeholder="Wpisz miasto..."
                            value={query}
                            onChange={handleInput}
                            autoFocus
                        />
                        <button className="loc-gps-btn" onClick={useGPS} disabled={gpsLoading} title="Użyj mojej lokalizacji">
                            {gpsLoading ? '⏳' : '🎯'}
                        </button>
                    </div>
                    {searching && <div className="loc-status">Szukam...</div>}
                    {results.length > 0 && (
                        <ul className="loc-results">
                            {results.map((r, i) => (
                                <li key={i} onClick={() => pick(r)}>
                                    <span className="loc-city">{r.name}</span>
                                    <span className="loc-region">{[r.admin1, r.country].filter(Boolean).join(', ')}</span>
                                </li>
                            ))}
                        </ul>
                    )}
                    {!searching && query.length >= 2 && results.length === 0 && (
                        <div className="loc-status">Brak wyników</div>
                    )}
                </div>
            )}
        </div>
    );
}
