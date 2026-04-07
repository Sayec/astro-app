import { NextRequest, NextResponse } from 'next/server';
import type { SatelliteResponse, SatellitePass } from '@/types';
import { redis } from '@/lib/redis';

const SATELLITES: Record<string, number> = {
    'ISS': 25544,
    'Hubble': 20580,
    'TIANGONG': 48274,
};

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const lat = searchParams.get('lat') || process.env.DEFAULT_LAT || '52.23';
    const lon = searchParams.get('lon') || process.env.DEFAULT_LON || '21.01';
    const alt = searchParams.get('alt') || '100';
    const days = searchParams.get('days') || '5';
    const minVisibility = searchParams.get('minvis') || '60';

    const cacheKey = `cache:satellites:${lat}:${lon}`;
    try {
        const cached = await redis.get<{ location: any, passes: SatellitePass[], count: number }>(cacheKey);
        if (cached) return NextResponse.json(cached);
    } catch(e) {}
    
    const apiKey = process.env.N2YO_API_KEY;
    if (!apiKey) {
        return Response.json({ error: 'N2YO API key not configured' }, { status: 500 });
    }

    try {
        const results = await Promise.allSettled(
            Object.entries(SATELLITES).map(async ([name, noradId]) => {
                const url = `https://api.n2yo.com/rest/v1/satellite/visualpasses/${noradId}/${lat}/${lon}/${alt}/${days}/${minVisibility}/?apiKey=${apiKey}`;

                const response = await fetch(url, { cache: 'no-store' });
                
                if (!response.ok) {
                    console.warn(`[N2YO] Failed for ${name}: ${response.status}`);
                    return { name, passes: [] };
                }

                const data = await response.json() as SatelliteResponse;
                const passes = (data.passes || []).map(p => ({
                    ...p,
                    satname: name,
                    satid: noradId,
                }));

                return { name, passes };
            })
        );

        const allPasses: SatellitePass[] = [];
        for (const result of results) {
            if (result.status === 'fulfilled' && result.value.passes) {
                allPasses.push(...result.value.passes);
            }
        }

        allPasses.sort((a, b) => a.startUTC - b.startUTC);

        const resultData = {
            location: { lat: parseFloat(lat), lon: parseFloat(lon) },
            passes: allPasses,
            count: allPasses.length,
        };

        try {
            await redis.set(cacheKey, resultData, { ex: 300 }); // 5 minut
        } catch(e) {}

        return NextResponse.json<{ location: { lat: number; lon: number }, passes: SatellitePass[], count: number }>(resultData);
    } catch (error) {
        console.error('[N2YO] Error:', error);
        return NextResponse.json({ error: 'Failed to fetch satellite data' }, { status: 500 });
    }
}
