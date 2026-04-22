import { NextRequest, NextResponse } from 'next/server';
import { calculateVisibility } from '@/lib/dsoVisibility';

function getAuthString(): string {
    const appId = process.env.ASTRONOMY_APP_ID || '';
    const appSecret = process.env.ASTRONOMY_APP_SECRET || '';
    return Buffer.from(`${appId}:${appSecret}`).toString('base64');
}

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const term = (searchParams.get('q') || '').trim();
    if (!term || term.length < 2) {
        return NextResponse.json({ results: [] });
    }

    const lat = parseFloat(searchParams.get('lat') as string) || parseFloat(process.env.DEFAULT_LAT || '51.20');
    const lon = parseFloat(searchParams.get('lon') as string) || parseFloat(process.env.DEFAULT_LON || '19.93');

    const authString = getAuthString();
    const searchUrl = `https://api.astronomyapi.com/api/v2/search?term=${encodeURIComponent(term)}&match_type=fuzzy&limit=8`;

    try {
        const response = await fetch(searchUrl, {
            headers: { 'Authorization': `Basic ${authString}` },
            next: { revalidate: 60 } // 1 minute cache
        });

        if (!response.ok) {
            const errText = await response.text();
            console.error(`[DSO Search] API error: ${response.status}`, errText);
            throw new Error(`AstronomyAPI error: ${response.status}`);
        }

        const apiData = await response.json();

        const results = (apiData.data || []).map((item: any) => {
            const raHours = parseFloat(item.position.equatorial.rightAscension.hours);
            const decDeg = parseFloat(item.position.equatorial.declination.degrees);
            const visibility = calculateVisibility(raHours, decDeg, lat, lon);

            const allNames = item.crossIdentification
                .map((ci: any) => ci.name)
                .filter((n: string, i: number, arr: string[]) => arr.indexOf(n) === i);

            return {
                id: item.id,
                name: item.name,
                type: item.type.name,
                typeId: item.type.id,
                subType: item.subType?.id || null,
                constellation: item.position.constellation?.name || '—',
                constellationShort: item.position.constellation?.short || '—',
                ra: { hours: raHours, string: item.position.equatorial.rightAscension.string },
                dec: { degrees: decDeg, string: item.position.equatorial.declination.string },
                alternativeNames: allNames,
                visibility,
            };
        });

        // Type is just infered as any above but we can force it through NextResponse
        return NextResponse.json<{ results: any[] }>({ results });
    } catch (error) {
        console.error('[DSO Search] Error:', error);
        return NextResponse.json({ error: 'Failed to search objects' }, { status: 500 });
    }
}
