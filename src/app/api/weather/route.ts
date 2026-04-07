import { NextRequest, NextResponse } from 'next/server';
import type { AstroWeatherResponse } from '@/lib/types';
import { redis } from '@/lib/redis';

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const lat = searchParams.get('lat') || process.env.DEFAULT_LAT || '52.23';
    const lon = searchParams.get('lon') || process.env.DEFAULT_LON || '21.01';

    const cacheKey = `cache:weather:${lat}:${lon}`;
    
    try {
        const cached = await redis.get<AstroWeatherResponse>(cacheKey);
        if (cached) return NextResponse.json<AstroWeatherResponse>(cached);
    } catch(e) { /* ignore redis read error */ }

    const url = `http://www.7timer.info/bin/api.pl?product=astro&lon=${lon}&lat=${lat}&output=json`;

    try {
        const response = await fetch(url, { cache: 'no-store' });
        if (!response.ok) {
            return NextResponse.json({ error: `7Timer API error: ${response.status}` }, { status: 500 });
        }
        const data = await response.json();
        
        try {
            await redis.set(cacheKey, data, { ex: 600 }); // { ex: 600 } to nasze ustalone 'interval' na 10 minut
        } catch(e) { /* ignore redis save error */ }

        return NextResponse.json<AstroWeatherResponse>(data);
    } catch (error) {
        console.error('[7Timer] Error:', error);
        return NextResponse.json({ error: 'Failed to fetch astro weather data' }, { status: 500 });
    }
}
