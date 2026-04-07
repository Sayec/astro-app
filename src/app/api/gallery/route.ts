import { NextRequest, NextResponse } from 'next/server';
import { uploadImage } from '@/lib/cloudinary';
import { getAllGalleryItems, saveGalleryItem } from '@/lib/gallery';
import type { GalleryItem } from '@/types';

export async function GET() {
    const items = await getAllGalleryItems();
    return NextResponse.json<GalleryItem[]>(items);
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

        const description = (formData.get('description') as string) || '';
        const date = (formData.get('date') as string) || new Date().toISOString().split('T')[0];
        const gear = (formData.get('gear') as string) || '';
        const exposure = (formData.get('exposure') as string) || '';
        const iso = (formData.get('iso') as string) || '';
        const tagsRaw = formData.get('tags') as string | null;
        let tags: string[] = [];
        try { tags = tagsRaw ? JSON.parse(tagsRaw) : []; } catch { tags = []; }

        const buffer = Buffer.from(await file.arrayBuffer());
        const { url, thumbnailUrl, publicId } = await uploadImage(buffer, file.name);

        const newItem: GalleryItem = {
            id: publicId,
            title,
            object,
            description,
            date,
            imageUrl: url,
            thumbnailUrl,
            tags,
            gear,
            exposure,
            iso,
            createdAt: new Date().toISOString(),
        };

        await saveGalleryItem(newItem);

        return NextResponse.json<GalleryItem>(newItem);
    } catch (error) {
        console.error('[Gallery POST] Error:', error);
        return NextResponse.json({ error: 'Failed to upload image' }, { status: 500 });
    }
}
