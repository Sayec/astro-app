import type {
    AstroWeatherResponse,
    SkyData,
    ApodData,
    SatelliteData,
    GalleryItem,
    DSOSearchResult,
    TopObjectsResponse
} from '@/types';

const API_BASE = '/api';

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
        let errStr = 'Upload failed';
        const contentType = res.headers.get('content-type');
        
        if (contentType && contentType.includes('application/json')) {
            try {
                const err = await res.json();
                errStr = err.error || errStr;
            } catch (e) {
                errStr = `Błąd serwera (${res.status}): Niepoprawny format JSON.`;
            }
        } else {
            const text = await res.text();
            if (res.status === 413) {
                errStr = 'Błąd: Plik jest zbyt duży (przekroczono limit wielkości).';
            } else {
                errStr = `Błąd serwera (${res.status}): ${text.substring(0, 100)}`;
            }
        }
        throw new Error(errStr);
    }
    
    return res.json();
}

export async function deletePhoto(id: string, adminKey: string): Promise<void> {
    const res = await fetch(`${API_BASE}/gallery/${encodeURIComponent(id)}`, {
        method: 'DELETE',
        headers: { 'x-admin-key': adminKey },
    });
    if (!res.ok) throw new Error('Delete failed');
}

export async function searchDSO(query: string, lat?: number, lon?: number): Promise<DSOSearchResult[]> {
    const params = new URLSearchParams({ q: query });
    if (lat) params.set('lat', lat.toString());
    if (lon) params.set('lon', lon.toString());
    const res = await fetch(`${API_BASE}/dso/search?${params}`);
    if (!res.ok) throw new Error('Failed to search DSO');
    const data = await res.json();
    return data.results || [];
}

export async function fetchTopObjects(lat?: number, lon?: number): Promise<TopObjectsResponse> {
    const params = new URLSearchParams();
    if (lat) params.set('lat', lat.toString());
    if (lon) params.set('lon', lon.toString());
    const res = await fetch(`${API_BASE}/top-objects?${params}`);
    if (!res.ok) throw new Error('Failed to fetch top objects');
    return res.json();
}

