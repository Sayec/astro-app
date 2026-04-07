import { NextRequest, NextResponse } from 'next/server';
import { getGalleryItems, uploadImageWithContext } from '@/lib/cloudinary';
import type { GalleryItem } from '@/lib/types';

export async function GET() {
    const items = await getGalleryItems();
    return NextResponse.json<GalleryItem[]>(items, {
        headers: {
            'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300'
        }
    });
}

export async function POST(request: NextRequest) {
    const adminKey = request.headers.get('x-admin-key');
    if (!adminKey || adminKey !== process.env.ADMIN_KEY) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const formData = await request.formData();
        const file = formData.get('image') as File | null;
        if (!file) {
            return NextResponse.json({ error: 'No image file provided' }, { status: 400 });
        }

        const title = formData.get('title') as string;
        const object = formData.get('object') as string;
        if (!title || !object) {
            return NextResponse.json({ error: 'Title and object are required' }, { status: 400 });
        }

        // other info
        const description = (formData.get('description') as string) || '';
        const date = (formData.get('date') as string) || new Date().toISOString().split('T')[0];
        const gear = (formData.get('gear') as string) || '';
        const exposure = (formData.get('exposure') as string) || '';
        const iso = (formData.get('iso') as string) || '';

        const buffer = Buffer.from(await file.arrayBuffer());

        const info = await uploadImageWithContext(buffer, file.name, {
            title, object, description, date, gear, exposure, iso
        });

        const newItem: GalleryItem = {
            id: info.publicId, // using publicId as the id
            title,
            object,
            description,
            date,
            imageUrl: info.url,
            thumbnailUrl: info.thumbnailUrl,
            tags: [], // no tags extraction easily right now
            gear,
            exposure,
            iso,
            createdAt: new Date().toISOString()
        };

        return NextResponse.json<GalleryItem>(newItem);
    } catch (error) {
        console.error('[Gallery POST] Error:', error);
        return NextResponse.json({ error: 'Failed to upload image' }, { status: 500 });
    }
}
