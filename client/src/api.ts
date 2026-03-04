// Dev: localhost, Prod: Vercel proxy
const API_BASE = import.meta.env.DEV
    ? 'http://localhost:3002/api'
    : '/api';

// ===== Types =====
export interface AstroWeatherPoint {
    timepoint: number;
    cloudcover: number;
    seeing: number;
    transparency: number;
    lifted_index: number;
    rh2m: number;
    wind10m: { direction: string; speed: number };
    temp2m: number;
    prec_type: string;
}

export interface AstroWeatherResponse {
    product: string;
    init: string;
    dataseries: AstroWeatherPoint[];
}

export interface MoonPhaseData {
    phase: string;
    illumination: number;
    ageDays: number;
    emoji: string;
}

export interface SkyData {
    moon: MoonPhaseData;
    sunrise: string;
    sunset: string;
    dayLengthHours: number;
    darkHoursStart: string;
    darkHoursEnd: string;
}

export interface ApodData {
    title: string;
    explanation: string;
    url: string;
    hdurl?: string;
    media_type: string;
    date: string;
    copyright?: string;
}

export interface SatellitePass {
    satname: string;
    satid: number;
    startUTC: number;
    startAzCompass: string;
    maxEl: number;
    endAzCompass: string;
    mag: number;
    duration: number;
}

export interface SatelliteData {
    location: { lat: number; lon: number };
    passes: SatellitePass[];
    count: number;
}

export interface GalleryItem {
    id: string;
    title: string;
    object: string;
    description: string;
    date: string;
    imageUrl: string;
    thumbnailUrl: string;
    tags?: string[];
    gear?: string;
    exposure?: string;
    iso?: string;
    createdAt: string;
}

// ===== API Functions =====
export async function fetchWeather(lat?: number, lon?: number): Promise<AstroWeatherResponse> {
    const params = new URLSearchParams();
    if (lat) params.set('lat', lat.toString());
    if (lon) params.set('lon', lon.toString());
    const res = await fetch(`${API_BASE}/weather?${params}`);
    if (!res.ok) throw new Error('Failed to fetch weather');
    return res.json();
}

export async function fetchSky(lat?: number, lon?: number): Promise<SkyData> {
    const params = new URLSearchParams();
    if (lat) params.set('lat', lat.toString());
    if (lon) params.set('lon', lon.toString());
    const res = await fetch(`${API_BASE}/sky?${params}`);
    if (!res.ok) throw new Error('Failed to fetch sky data');
    return res.json();
}

export async function fetchApod(date?: string): Promise<ApodData> {
    const params = date ? `?date=${date}` : '';
    const res = await fetch(`${API_BASE}/apod${params}`);
    if (!res.ok) throw new Error('Failed to fetch APOD');
    return res.json();
}

export async function fetchSatellites(lat?: number, lon?: number): Promise<SatelliteData> {
    const params = new URLSearchParams();
    if (lat) params.set('lat', lat.toString());
    if (lon) params.set('lon', lon.toString());
    const res = await fetch(`${API_BASE}/satellites?${params}`);
    if (!res.ok) throw new Error('Failed to fetch satellites');
    return res.json();
}

export async function fetchGallery(): Promise<GalleryItem[]> {
    const res = await fetch(`${API_BASE}/gallery`);
    if (!res.ok) throw new Error('Failed to fetch gallery');
    return res.json();
}

export async function uploadPhoto(formData: FormData, adminKey: string): Promise<GalleryItem> {
    const res = await fetch(`${API_BASE}/gallery`, {
        method: 'POST',
        headers: { 'x-admin-key': adminKey },
        body: formData,
    });
    if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Upload failed');
    }
    return res.json();
}

export async function deletePhoto(id: string, adminKey: string): Promise<void> {
    const res = await fetch(`${API_BASE}/gallery/${id}`, {
        method: 'DELETE',
        headers: { 'x-admin-key': adminKey },
    });
    if (!res.ok) throw new Error('Delete failed');
}
