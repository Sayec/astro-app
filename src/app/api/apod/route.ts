import { NextRequest, NextResponse } from 'next/server';
import type { ApodData } from '@/lib/types';
import { redis } from '@/lib/redis';

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const date = searchParams.get('date');
    const apiKey = process.env.NASA_API_KEY || 'DEMO_KEY';

    let url = `https://api.nasa.gov/planetary/apod?api_key=${apiKey}`;
    if (date) {
        url += `&date=${date}`;
    }

    const cacheKey = `cache:apod:${date || 'today'}`;
    try {
        const cached = await redis.get<ApodData>(cacheKey);
        if (cached) return NextResponse.json<ApodData>(cached);
    } catch(e) {}

    try {
        const response = await fetch(url, { cache: 'no-store' });
        
        if (!response.ok) {
            const errorBody = await response.text();
            return Response.json({ error: `NASA API error: ${response.status} - ${errorBody}` }, { status: 500 });
        }

        const data = await response.json();

        try {
            await redis.set(cacheKey, data, { ex: 86400 }); // 24 h
        } catch(e) {}

        return NextResponse.json<ApodData>(data);
    } catch (error) {
        console.error('[NASA APOD] Error:', error);
        return NextResponse.json({ error: 'Failed to fetch NASA APOD' }, { status: 500 });
    }
}
