import { useState, useEffect } from 'react';
import { fetchApod, ApodData } from '../api';
import './NasaApod.css';

export default function NasaApod() {
    const [data, setData] = useState<ApodData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [expanded, setExpanded] = useState(false);

    // Navigate by date
    const [currentDate, setCurrentDate] = useState<string>('');

    useEffect(() => {
        setLoading(true);
        fetchApod(currentDate || undefined)
            .then(res => { setData(res); setLoading(false); })
            .catch(err => { setError(err.message); setLoading(false); });
    }, [currentDate]);

    function goToDay(offset: number) {
        const base = currentDate ? new Date(currentDate) : new Date();
        base.setDate(base.getDate() + offset);
        // Don't go to the future
        if (base > new Date()) return;
        setCurrentDate(base.toISOString().split('T')[0]);
    }

    if (loading) return <div className="module-card loading">⏳ Ładowanie zdjęcia dnia...</div>;
    if (error) return <div className="module-card error">❌ {error}</div>;
    if (!data) return null;

    return (
        <div className="module-card nasa-apod">
            <div className="module-header">
                <h2>📸 Zdjęcie Dnia – NASA</h2>
                <div className="apod-nav">
                    <button className="nav-btn" onClick={() => goToDay(-1)}>←</button>
                    <span className="apod-date">{data.date}</span>
                    <button className="nav-btn" onClick={() => goToDay(1)}>→</button>
                </div>
            </div>

            <div className="apod-content">
                {data.media_type === 'image' ? (
                    <div className="apod-image-wrapper">
                        <img
                            src={data.url}
                            alt={data.title}
                            className="apod-image"
                            onClick={() => data.hdurl && window.open(data.hdurl, '_blank')}
                        />
                        {data.hdurl && <span className="hd-badge" onClick={() => window.open(data.hdurl, '_blank')}>HD</span>}
                    </div>
                ) : data.url.includes('youtube') || data.url.includes('youtu.be') ? (
                    <div className="apod-video-wrapper">
                        <iframe src={data.url} title={data.title} allowFullScreen></iframe>
                    </div>
                ) : (
                    <div className="apod-video-link">
                        <a href={data.url} target="_blank" rel="noopener noreferrer">
                            🎬 Otwórz wideo w nowej karcie →
                        </a>
                    </div>
                )}

                <div className="apod-info">
                    <h3 className="apod-title">{data.title}</h3>
                    {data.copyright && <span className="apod-copyright">© {data.copyright}</span>}
                    <p className={`apod-explanation ${expanded ? 'expanded' : ''}`}>
                        {data.explanation}
                    </p>
                    {data.explanation.length > 300 && (
                        <button className="expand-btn" onClick={() => setExpanded(!expanded)}>
                            {expanded ? 'Zwiń ▲' : 'Czytaj więcej ▼'}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
