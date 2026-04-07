'use client';

import { useState, useCallback, useRef } from 'react';
import { searchDSO, DSOSearchResult } from '@/api';
import { Location } from './LocationPicker';
import './ObjectSearch.css';

const MONTH_SHORT = ['Sty', 'Lut', 'Mar', 'Kwi', 'Maj', 'Cze', 'Lip', 'Sie', 'Wrz', 'Paź', 'Lis', 'Gru'];
const EXAMPLE_OBJECTS = ['M42', 'M31', 'NGC 7000', 'M45', 'M51', 'M101', 'NGC 6992'];

function getTypeEmoji(typeId: string): string {
    const map: Record<string, string> = {
        'G': '🌀', 'GGroup': '🌀', 'GCluster': '🌀',
        'PN': '🫧', 'SNR': '💫', 'HII': '🌫️',
        'OCl': '✨', 'GCl': '⭐', 'Cl+N': '✨',
        'EN': '🌫️', 'RN': '🌫️', 'EN+RN': '🌫️',
        'AGN': '💥', 'QSO': '💥',
        '*': '⭐', '**': '⭐',
    };
    return map[typeId] || '🔭';
}

function getTypeNamePL(type: string): string {
    const map: Record<string, string> = {
        'Galaxy': 'Galaktyka',
        'Galaxy Group': 'Grupa galaktyk',
        'Galaxy Cluster': 'Gromada galaktyk',
        'Planetary Nebula': 'Mgławica planetarna',
        'Super Nova Remnant': 'Pozostałość po supernowej',
        'HII Region': 'Region HII',
        'Open Cluster': 'Gromada otwarta',
        'Globular Cluster': 'Gromada kulista',
        'Cluster + Nebula': 'Gromada + mgławica',
        'Emission Nebula': 'Mgławica emisyjna',
        'Reflection Nebula': 'Mgławica refleksyjna',
        'Star': 'Gwiazda',
        'Double Star': 'Gwiazda podwójna',
    };
    return map[type] || type;
}

export default function ObjectSearch({ location }: { location: Location }) {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<DSOSearchResult[]>([]);
    const [loading, setLoading] = useState(false);
    const [searched, setSearched] = useState(false);
    const [expandedId, setExpandedId] = useState<string | null>(null);
    const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const doSearch = useCallback((term: string) => {
        if (term.length < 2) {
            setResults([]);
            setSearched(false);
            return;
        }

        setLoading(true);
        setSearched(true);
        searchDSO(term, location.lat, location.lon)
            .then(res => {
                setResults(res);
                setLoading(false);
            })
            .catch(() => {
                setResults([]);
                setLoading(false);
            });
    }, [location]);

    const handleInputChange = (value: string) => {
        setQuery(value);
        if (debounceRef.current) clearTimeout(debounceRef.current);
        debounceRef.current = setTimeout(() => doSearch(value), 400);
    };

    const handleTagClick = (tag: string) => {
        setQuery(tag);
        doSearch(tag);
    };

    const handleClear = () => {
        setQuery('');
        setResults([]);
        setSearched(false);
        setExpandedId(null);
    };

    const toggleExpand = (id: string) => {
        setExpandedId(prev => prev === id ? null : id);
    };

    return (
        <div className="module-card object-search">
            <div className="module-header">
                <h2>🔍 Wyszukiwarka Obiektów</h2>
                <span className="module-subtitle">AstronomyAPI • DSO Katalog</span>
            </div>

            {/* Search input */}
            <div className="dso-search-box">
                <span className="dso-search-icon">🔭</span>
                <input
                    type="text"
                    value={query}
                    onChange={e => handleInputChange(e.target.value)}
                    placeholder="Wpisz nazwę obiektu (M42, NGC 7000, Andromeda...)"
                    id="dso-search-input"
                />
                {query && (
                    <button className="dso-search-clear" onClick={handleClear} aria-label="Wyczyść">✕</button>
                )}
            </div>

            {/* Hint state – no search yet */}
            {!searched && !loading && (
                <div className="dso-hint">
                    <p>Wyszukaj obiekt Deep Sky i sprawdź, kiedy najlepiej go obserwować 🌌</p>
                    <div className="hint-examples">
                        {EXAMPLE_OBJECTS.map(ex => (
                            <span key={ex} className="hint-tag" onClick={() => handleTagClick(ex)}>{ex}</span>
                        ))}
                    </div>
                </div>
            )}

            {/* Loading */}
            {loading && (
                <div className="dso-loading">
                    <span className="spinner">🔄</span> Szukam obiektów...
                </div>
            )}

            {/* No results */}
            {searched && !loading && results.length === 0 && (
                <div className="dso-no-results">
                    Nie znaleziono obiektów dla „{query}" 😞
                </div>
            )}

            {/* Results */}
            {!loading && results.length > 0 && (
                <div className="dso-results">
                    {results.map(obj => {
                        const isExpanded = expandedId === obj.id;
                        const vis = obj.visibility;
                        const currentMonth = new Date().getMonth() + 1;

                        return (
                            <div
                                key={obj.id}
                                className={`dso-result-card ${isExpanded ? 'expanded' : ''}`}
                                onClick={() => toggleExpand(obj.id)}
                            >
                                {/* Header */}
                                <div className="dso-card-header">
                                    <div className="dso-card-title">
                                        <div className="dso-card-name">
                                            {getTypeEmoji(obj.typeId)} {obj.name} <span style={{fontSize: '0.85em', color: 'var(--text-muted)'}}>({vis.currentAltitude > 0 ? '+' : ''}{vis.currentAltitude}°)</span>
                                        </div>
                                        <div className="dso-card-type">
                                            {getTypeNamePL(obj.type)}
                                        </div>
                                    </div>
                                    <div className="dso-card-badge">
                                        <span className="dso-constellation-badge">
                                            {obj.constellation}
                                        </span>
                                        <span className={`dso-visibility-indicator ${vis.neverRises ? 'never' : vis.isAboveHorizon ? 'visible' : 'below'}`}>
                                            {vis.neverRises ? '❌ Niewidoczny' : vis.isAboveHorizon ? '🟢 Widoczny teraz' : '🌙 Pod horyzontem'}
                                        </span>
                                    </div>
                                </div>

                                {/* Alternative names */}
                                {obj.alternativeNames.length > 1 && (
                                    <div className="dso-alt-names">
                                        {obj.alternativeNames.map(n => (
                                            <span key={n} className="dso-alt-name">{n}</span>
                                        ))}
                                    </div>
                                )}

                                {/* Expanded details */}
                                {isExpanded && (
                                    <div className="dso-details">
                                        {/* Coordinates */}
                                        <div className="dso-coords">
                                            <div className="dso-coord">
                                                <span className="dso-coord-label">RA:</span>
                                                <span className="dso-coord-value">{obj.ra.string}</span>
                                            </div>
                                            <div className="dso-coord">
                                                <span className="dso-coord-label">Dec:</span>
                                                <span className="dso-coord-value">{obj.dec.string}</span>
                                            </div>
                                        </div>

                                        {/* Months visibility chart */}
                                        <div className="dso-months-section">
                                            <div className="dso-months-label">📅 Najlepsze miesiące do obserwacji</div>
                                            <div className="dso-months-grid">
                                                {MONTH_SHORT.map((m, i) => {
                                                    const month = i + 1;
                                                    const isBest = vis.bestMonths.includes(month);
                                                    const isCurrent = month === currentMonth;
                                                    return (
                                                        <div key={m} className="dso-month-bar">
                                                            <div className={`dso-month-fill ${isBest ? 'best' : 'ok'}`}
                                                                style={{ opacity: isCurrent ? 1 : undefined, border: isCurrent ? '1px solid rgba(255,255,255,0.3)' : undefined }} />
                                                            <span className="dso-month-name" style={{ color: isCurrent ? 'var(--accent-purple)' : undefined, fontWeight: isCurrent ? 600 : undefined }}>
                                                                {m}
                                                            </span>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>

                                        {/* Stat grid */}
                                        <div className="dso-info-grid">
                                            <div className="dso-info-item">
                                                <div className="dso-info-label">Maks. wysokość</div>
                                                <div className="dso-info-value">{vis.maxAltitude}°</div>
                                            </div>
                                            <div className="dso-info-item">
                                                <div className="dso-info-label">Aktualna wysokość</div>
                                                <div className="dso-info-value">{vis.currentAltitude}°</div>
                                            </div>
                                            <div className="dso-info-item">
                                                <div className="dso-info-label">Sezon</div>
                                                <div className="dso-info-value">{vis.bestSeason}</div>
                                            </div>
                                            <div className="dso-info-item">
                                                <div className="dso-info-label">Cirkumpolarny</div>
                                                <div className="dso-info-value">{vis.isCircumpolar ? 'Tak ✓' : 'Nie'}</div>
                                            </div>
                                        </div>

                                        {/* Recommendation */}
                                        <div className="dso-recommendation">
                                            {vis.recommendation}
                                        </div>
                                    </div>
                                )}

                                <div className="dso-expand-icon">
                                    {isExpanded ? '▲' : '▼'}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
