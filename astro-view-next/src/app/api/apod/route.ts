import { NextRequest, NextResponse } from 'next/server';
import type { ApodData } from '@/lib/types';

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const date = searchParams.get('date');
    const apiKey = process.env.NASA_API_KEY || 'DEMO_KEY';

    let url = `https://api.nasa.gov/planetary/apod?api_key=${apiKey}`;
    if (date) {
        url += `&date=${date}`;
    }

    try {
        const response = await fetch(url, {
            next: { revalidate: 86400 } // 24 hours cache
        });
        
        if (!response.ok) {
            const errorBody = await response.text();
            return Response.json({ error: `NASA API error: ${response.status} - ${errorBody}` }, { status: 500 });
        }

        const data = await response.json();
        return NextResponse.json<ApodData>(data);
    } catch (error) {
        console.error('[NASA APOD] Error:', error);
        return NextResponse.json({ error: 'Failed to fetch NASA APOD' }, { status: 500 });
    }
}
