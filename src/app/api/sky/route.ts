import { NextRequest, NextResponse } from 'next/server';
import { getMoonPhase } from '@/lib/moonPhase';
import type { SkyData } from '@/lib/types';
import { redis } from '@/lib/redis';

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const lat = searchParams.get('lat') || process.env.DEFAULT_LAT || '52.23';
    const lon = searchParams.get('lon') || process.env.DEFAULT_LON || '21.01';

    const cacheKey = `cache:sky:${lat}:${lon}`;

    try {
        const cached = await redis.get<SkyData>(cacheKey);
        if (cached) return NextResponse.json<SkyData>(cached);
    } catch(e) {}

    try {
        const meteoUrl = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&daily=sunrise,sunset&timezone=auto&forecast_days=1`;
        
        const response = await fetch(meteoUrl, { cache: 'no-store' });
        
        if (!response.ok) {
            return Response.json({ error: `Open-Meteo API error: ${response.status}` }, { status: 500 });
        }

        const meteoData = await response.json();
        const sunrise = meteoData.daily.sunrise[0];
        const sunset = meteoData.daily.sunset[0];

        const sunsetDate = new Date(sunset);
        const sunriseDate = new Date(sunrise);
        const darkStart = new Date(sunsetDate.getTime() + 90 * 60 * 1000); // +1.5h
        const darkEnd = new Date(sunriseDate.getTime() - 90 * 60 * 1000);   // -1.5h

        const dayLengthMs = sunsetDate.getTime() - sunriseDate.getTime();
        const dayLengthHours = Math.round(dayLengthMs / (1000 * 60 * 60) * 10) / 10;

        const moon = getMoonPhase(new Date());

        const skyData: SkyData = {
            moon,
            sunrise: sunrise.split('T')[1] || sunrise,
            sunset: sunset.split('T')[1] || sunset,
            dayLengthHours,
            darkHoursStart: darkStart.toTimeString().slice(0, 5),
            darkHoursEnd: darkEnd.toTimeString().slice(0, 5),
        };

        try {
            await redis.set(cacheKey, skyData, { ex: 3600 }); // 1 godzina 
        } catch(e) {}

        return NextResponse.json<SkyData>(skyData);
    } catch (error) {
        console.error('[Sky] Error:', error);
        return NextResponse.json({ error: 'Failed to fetch sky data' }, { status: 500 });
    }
}
