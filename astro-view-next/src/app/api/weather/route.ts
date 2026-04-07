import { NextRequest, NextResponse } from 'next/server';
import type { AstroWeatherResponse } from '@/lib/types';

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const lat = searchParams.get('lat') || process.env.DEFAULT_LAT || '52.23';
    const lon = searchParams.get('lon') || process.env.DEFAULT_LON || '21.01';

    const url = `http://www.7timer.info/bin/api.pl?product=astro&lon=${lon}&lat=${lat}&output=json`;

    try {
        const response = await fetch(url, {
            next: { revalidate: 600 } // 10 minutes cache
        });
        if (!response.ok) {
            return NextResponse.json({ error: `7Timer API error: ${response.status}` }, { status: 500 });
        }
        const data = await response.json();
        return NextResponse.json<AstroWeatherResponse>(data);
    } catch (error) {
        console.error('[7Timer] Error:', error);
        return NextResponse.json({ error: 'Failed to fetch astro weather data' }, { status: 500 });
    }
}
