'use client';

import React, { useEffect, useRef, useState } from 'react';
import './SkyMap.css';
import { Application, Graphics } from 'pixi.js';
import { Horizon, Observer, MakeTime } from 'astronomy-engine';
import { Location } from './LocationPicker';

interface SkyMapProps {
    location: Location;
}

export default function SkyMap({ location }: SkyMapProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    const appRef = useRef<Application | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let active = true;
        let animationFrameId: number;
        let intervalId: NodeJS.Timeout;

        async function init() {
            if (!containerRef.current) return;
            // Początkowy stan loading=true jest już ustawiony w useState

            // Pobranie katalogu gwiazd
            let starData;
            try {
                const res = await fetch('/data/stars.json');
                if (!res.ok) throw new Error('Data not found');
                starData = await res.json();
            } catch (err) {
                console.error("Failed to load star data:", err);
                if (active) setLoading(false);
                return;
            }

            if (!active) return;

            // Inicjalizacja środowiska PixiJS v8
            const app = new Application();
            // Obliczamy szerokość kontenera
            const containerWidth = containerRef.current.clientWidth || 300;

            await app.init({
                width: containerWidth,
                height: containerWidth, // kwadrat dla okrągłej mapy
                backgroundAlpha: 0,
                resolution: window.devicePixelRatio || 1,
                antialias: true
            });

            if (!active) {
                app.destroy(true);
                return;
            }

            // Upewniamy się, że nie dodajemy canvasu wielokrotnie w strict mode
            const existingCanvas = containerRef.current.querySelector('canvas');
            if (existingCanvas) {
                containerRef.current.removeChild(existingCanvas);
            }
            containerRef.current.appendChild(app.canvas);
            appRef.current = app;

            const graphics = new Graphics();
            app.stage.addChild(graphics);

            const renderStars = () => {
                if (!active) return;

                // Konfiguracja obserwatora i czasu
                const obs = new Observer(location.lat, location.lon, 0);
                const time = MakeTime(new Date());

                graphics.clear();

                const R = containerWidth / 2;
                const centerX = containerWidth / 2;
                const centerY = containerWidth / 2;

                for (const feature of starData.features) {
                    const [ra_deg, dec_deg] = feature.geometry.coordinates;
                    // Konwersja stopni RA na godziny (astronomy-engine wymaga godzin 0..24)
                    const ra_hours = ra_deg < 0 ? (ra_deg + 360) / 15 : ra_deg / 15;
                    const mag = feature.properties.mag;

                    // Ograniczamy widoczność wyblakłych gwiazd dla wydajności i estetyki
                    if (mag > 5.5) continue;

                    // Obliczenie współrzędnych horyzontalnych: altitude (wysokość) i azimuth (kierunek)
                    const hor = Horizon(time, obs, ra_hours, dec_deg, 'normal');
                    const alt = hor.altitude;
                    const az = hor.azimuth;

                    // Ignoruj gwiazdy poniżej horyzontu (altitude < 0)
                    if (alt >= 0) {
                        // Rzutowanie azymutalne: zenit (alt=90) to środek, horyzont (alt=0) to brzeg (promień R)
                        const r = R * (1 - alt / 90);

                        // Azimuth: 0 to Północ, 90 to Wschód, 180 to Południe, 270 to Zachód.
                        // Standardowe płótno ma oś X w prawo, oś Y w dół.
                        // Aby ułożyć N na górze (jak kompas), odejmujemy 90 stopni od azymutu
                        const theta = (az - 90) * (Math.PI / 180);

                        // Odbicie lustrzane osi X względem standardowego układu matematycznego.
                        // W mapach nieba (astronomicznych) kiedy N jest na górze, Wschód (E) jest po LEWEJ stronie.
                        const x = centerX - r * Math.cos(theta);
                        const y = centerY + r * Math.sin(theta);

                        // Wielkość i przezroczystość na podstawie magnitudo
                        const brightness = Math.max(0.1, 1 - (mag - -1.5) / 7.0);
                        const radius = Math.max(1.3, Math.min(2 - mag * 0.4, 1.8));
                        const color = 0xffffff; // Potencjalnie można zmienić na podstawie indeksu B-V

                        graphics.circle(x, y, radius).fill({ color, alpha: brightness });
                    }
                }
            };

            // Wykonujemy pierwsze rysowanie
            renderStars();
            setLoading(false);

            // Odświeżamy powoli mapę nieba co np. 30 sekund żeby odzwierciedlić rotację Ziemi
            intervalId = setInterval(() => {
                animationFrameId = requestAnimationFrame(renderStars);
            }, 30000);
        }

        init();

        return () => {
            active = false;
            if (intervalId) clearInterval(intervalId);
            if (animationFrameId) cancelAnimationFrame(animationFrameId);
            if (appRef.current) {
                appRef.current.destroy(true, { children: true, texture: true });
            }
        };
    }, [location.lat, location.lon]);

    return (
        <div className="skymap-card">
            <div className="skymap-header">
                <span className="emoji">🌌</span>
                <h2>Mapa Nieba</h2>
            </div>
            <div className="skymap-wrapper">
                <div className="skymap-container" ref={containerRef}>
                    {loading && <div className="skymap-loading">Ładowanie mapy...</div>}
                </div>

                {/* Oznaczenia stron świata względem płótna */}
                <div className="skymap-label n">N</div>
                <div className="skymap-label e">E</div>
                <div className="skymap-label s">S</div>
                <div className="skymap-label w">W</div>
            </div>
        </div>
    );
}
