'use client';

import React, { useState, useEffect } from 'react';
import { fetchWeather } from '@/api';
import type { AstroWeatherPoint } from '@/types';
import { Location } from './LocationPicker';
import './AstroWeather.css';

const CLOUD_LABELS = ['0%', '0-6%', '6-19%', '19-31%', '31-44%', '44-56%', '56-69%', '69-81%', '81-94%', '94-100%'];
const SEEING_LABELS = ['', '<0.5"', '0.5-0.75"', '0.75-1"', '1-1.25"', '1.25-1.5"', '1.5-2"', '2-2.5"', '>2.5"'];
const TRANSPARENCY_LABELS = ['', 'Doskonała', 'Ponadprzeciętna', 'Średnia', 'Poniżej średniej', 'Słaba', 'Bardzo słaba', 'Terrible', 'N/A'];

const DAY_NAMES = ['Niedziela', 'Poniedziałek', 'Wtorek', 'Środa', 'Czwartek', 'Piątek', 'Sobota'];

function getCloudClass(cover: number): string {
    if (cover <= 2) return 'excellent';
    if (cover <= 4) return 'good';
    if (cover <= 6) return 'average';
    return 'poor';
}

function getSeeingClass(seeing: number): string {
    if (seeing <= 2) return 'excellent';
    if (seeing <= 4) return 'good';
    if (seeing <= 6) return 'average';
    return 'poor';
}

function getTransparencyClass(transp: number): string {
    if (transp <= 2) return 'excellent';
    if (transp <= 4) return 'good';
    if (transp <= 6) return 'average';
    return 'poor';
}

function avg(arr: number[]): number {
    const valid = arr.filter(v => v > -999);
    if (valid.length === 0) return 0;
    return Math.round(valid.reduce((a, b) => a + b, 0) / valid.length);
}

interface DayGroup {
    date: Date;
    label: string;       // "Wtorek 04.03"
    points: AstroWeatherPoint[];
    avgCloud: number;
    avgSeeing: number;
    avgTransparency: number;
    minTemp: number;
    maxTemp: number;
    incomplete: boolean; // true if some data points have -9999 values
}

function groupByDay(points: AstroWeatherPoint[], initStr: string): DayGroup[] {
    // Parse init: "2024030418" → Date
    const initYear = parseInt(initStr.slice(0, 4));
    const initMonth = parseInt(initStr.slice(4, 6)) - 1;
    const initDay = parseInt(initStr.slice(6, 8));
    const initHour = parseInt(initStr.slice(8, 10));
    const initDate = new Date(initYear, initMonth, initDay, initHour);

    const dayMap = new Map<string, { date: Date; points: AstroWeatherPoint[] }>();

    for (const point of points) {
        const pointDate = new Date(initDate.getTime() + point.timepoint * 3600 * 1000);
        const dayKey = `${pointDate.getFullYear()}-${pointDate.getMonth()}-${pointDate.getDate()}`;

        if (!dayMap.has(dayKey)) {
            dayMap.set(dayKey, { date: new Date(pointDate.getFullYear(), pointDate.getMonth(), pointDate.getDate()), points: [] });
        }
        dayMap.get(dayKey)!.points.push(point);
    }

    const groups: DayGroup[] = [];
    for (const [, { date, points: pts }] of dayMap) {
        const dayName = DAY_NAMES[date.getDay()];
        const dd = String(date.getDate()).padStart(2, '0');
        const mm = String(date.getMonth() + 1).padStart(2, '0');
        const hasInvalid = pts.some(p => p.temp2m <= -999);
        const validTemps = pts.map(p => p.temp2m).filter(t => t > -999);
        groups.push({
            date,
            label: `${dayName} ${dd}.${mm}`,
            points: pts,
            avgCloud: avg(pts.map(p => p.cloudcover)),
            avgSeeing: avg(pts.map(p => p.seeing)),
            avgTransparency: avg(pts.map(p => p.transparency)),
            minTemp: validTemps.length ? Math.min(...validTemps) : 0,
            maxTemp: validTemps.length ? Math.max(...validTemps) : 0,
            incomplete: hasInvalid,
        });
    }

    return groups;
}

function getHourLabel(timepoint: number, initStr: string): string {
    const initHour = parseInt(initStr.slice(8, 10));
    const hour = (initHour + timepoint) % 24;
    return `${String(hour).padStart(2, '0')}:00`;
}

export default function AstroWeather({ location }: { location: Location }) {
    const [days, setDays] = useState<DayGroup[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [initTime, setInitTime] = useState('');
    const [expandedDay, setExpandedDay] = useState<number>(-1);
    const [closingDay, setClosingDay] = useState<number>(-1);

    const handleDayClick = (i: number) => {
        if (expandedDay === i) {
            // Collapse with animation
            setClosingDay(i);
            setExpandedDay(-1);
            setTimeout(() => setClosingDay(-1), 300);
        } else {
            // If another day was expanded, close it instantly and open the new one
            setClosingDay(-1);
            setExpandedDay(i);
        }
    };

    useEffect(() => {
        setLoading(true);
        setError('');
        fetchWeather(location.lat, location.lon)
            .then(res => {
                const init = res.init || '';
                setInitTime(init);
                const grouped = groupByDay(res.dataseries.slice(0, 24), init);
                setDays(grouped);
                setExpandedDay(-1);
                setLoading(false);
            })
            .catch(err => { setError(err.message); setLoading(false); });
    }, [location]);

    if (loading) return <div className="module-card loading">⏳ Ładowanie prognozy...</div>;
    if (error) return <div className="module-card error">❌ {error}</div>;

    return (
        <div className="module-card astro-weather">
            <div className="module-header">
                <h2>🌤️ Prognoza Astropogody</h2>
                <span className="module-subtitle">7Timer! • 72h</span>
            </div>

            {/* Daily summary cards */}
            <div className="day-cards" style={{ gridTemplateColumns: `repeat(${Math.max(1, days.length)}, 1fr)` }}>
                {days.map((day, i) => (
                    <React.Fragment key={i}>
                        <div
                            className={`day-card ${getCloudClass(day.avgCloud)} ${expandedDay === i ? 'active' : ''}`}
                            onClick={() => handleDayClick(i)}
                            style={{ gridRow: '1', gridColumn: `${i + 1}` }}
                        >
                            <div className="day-label">{day.label}</div>
                            <div className="day-icon">
                                {day.avgCloud <= 2 ? '☀️' : day.avgCloud <= 5 ? '⛅' : '☁️'}
                            </div>
                            <div className="day-cloud">{CLOUD_LABELS[day.avgCloud] || '—'}{day.incomplete ? ' *' : ''}</div>
                            <div className="day-stats">
                                <span className={`seeing-dot ${getSeeingClass(day.avgSeeing)}`} title={`Seeing: ${SEEING_LABELS[day.avgSeeing] || '?'}`}></span>
                                <span className={`transp-dot ${getTransparencyClass(day.avgTransparency)}`} title={`Transp: ${TRANSPARENCY_LABELS[day.avgTransparency] || '?'}`}></span>
                                <span className="day-temp">{day.maxTemp}° / {day.minTemp}°{day.incomplete ? ' *' : ''}</span>
                            </div>
                            <div className="day-expand-hint">{expandedDay === i || closingDay === i ? '▲' : '▼'}</div>
                        </div>

                        {/* Expanded hourly detail */}
                        {(expandedDay === i || closingDay === i) && (
                            <div className={`hourly-detail ${closingDay === i ? 'closing' : ''}`} style={{ gridRow: '2', gridColumn: '1 / -1' }}>
                                <div className="hourly-title">{day.label} — szczegóły co 3h</div>
                                <div className="hourly-grid">
                                    {day.points.map((point, j) => (
                                        <div key={j} className={`weather-cell ${getCloudClass(point.cloudcover)}`}>
                                            <div className="weather-hour">{getHourLabel(point.timepoint, initTime)}</div>
                                            <div className="weather-cloud-icon">
                                                {point.cloudcover <= 2 ? '☀️' : point.cloudcover <= 5 ? '⛅' : '☁️'}
                                            </div>
                                            <div className="weather-cloud-text">{CLOUD_LABELS[point.cloudcover]}</div>
                                            <div className="weather-detail">
                                                <span className={`seeing-dot ${getSeeingClass(point.seeing)}`}></span>
                                                Seeing: {SEEING_LABELS[point.seeing] || '?'}
                                            </div>
                                            <div className="weather-detail">
                                                Transp: {TRANSPARENCY_LABELS[point.transparency] || '?'}
                                            </div>
                                            <div className="weather-temp">{point.temp2m > -999 ? `${point.temp2m}°C` : '—'}</div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </React.Fragment>
                ))}
            </div>

            <div className="weather-legend">
                <div className="legend-section">
                    <span className="legend-title">Zachmurzenie:</span>
                    <span className="legend-item"><span className="dot excellent"></span> 0-19%</span>
                    <span className="legend-item"><span className="dot good"></span> 19-44%</span>
                    <span className="legend-item"><span className="dot average"></span> 44-69%</span>
                    <span className="legend-item"><span className="dot poor"></span> 69-100%</span>
                </div>
                <div className="legend-section">
                    <span className="legend-title">Seeing:</span>
                    <span className="legend-item"><span className="dot excellent"></span> &lt;0.75"</span>
                    <span className="legend-item"><span className="dot good"></span> 0.75-1.25"</span>
                    <span className="legend-item"><span className="dot average"></span> 1.25-2"</span>
                    <span className="legend-item"><span className="dot poor"></span> &gt;2"</span>
                </div>
                <div className="legend-section">
                    <span className="legend-title">Transp:</span>
                    <span className="legend-item"><span className="dot excellent"></span> Doskonała</span>
                    <span className="legend-item"><span className="dot good"></span> Ponadprzeciętna</span>
                    <span className="legend-item"><span className="dot average"></span> Średnia</span>
                    <span className="legend-item"><span className="dot poor"></span> Słaba</span>
                </div>
            </div>

            {days.some(d => d.incomplete) && (
                <div className="weather-footnote">* Dane za ten dzień są niepełne — zakresy mogą być niedokładne</div>
            )}
        </div>
    );
}
