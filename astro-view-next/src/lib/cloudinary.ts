import { v2 as cloudinary } from 'cloudinary';
import type { GalleryItem } from './types';

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function uploadImageWithContext(
    buffer: Buffer,
    originalName: string,
    contextInfo: { title: string, object?: string, description?: string, date?: string, gear?: string, exposure?: string, iso?: string }
): Promise<{ url: string; thumbnailUrl: string, publicId: string }> {
    return new Promise((resolve, reject) => {
        const contextEntries = [];
        if (contextInfo.title) contextEntries.push(`title=${contextInfo.title}`);
        if (contextInfo.object) contextEntries.push(`object=${contextInfo.object}`);
        if (contextInfo.description) contextEntries.push(`description=${contextInfo.description}`);
        if (contextInfo.date) contextEntries.push(`date=${contextInfo.date}`);
        if (contextInfo.gear) contextEntries.push(`gear=${contextInfo.gear}`);
        if (contextInfo.exposure) contextEntries.push(`exposure=${contextInfo.exposure}`);
        if (contextInfo.iso) contextEntries.push(`iso=${contextInfo.iso}`);

        const uploadStream = cloudinary.uploader.upload_stream(
            {
                folder: 'astro-view',
                resource_type: 'image',
                public_id: `astro_${Date.now()}`,
                transformation: [{ quality: 'auto', fetch_format: 'auto' }],
                context: contextEntries.join('|')
            },
            (error, result) => {
                if (error || !result) {
                    reject(error || new Error('Upload failed'));
                    return;
                }
                const thumbnailUrl = cloudinary.url(result.public_id, {
                    width: 400,
                    height: 300,
                    crop: 'fill',
                    quality: 'auto',
                    fetch_format: 'auto',
                });

                resolve({
                    url: result.secure_url,
                    thumbnailUrl,
                    publicId: result.public_id
                });
            }
        );
        uploadStream.end(buffer);
    });
}

export async function getGalleryItems(): Promise<GalleryItem[]> {
    try {
        const result = await cloudinary.api.resources({
            type: 'upload',
            prefix: 'astro-view/',
            context: true,
            max_results: 100,
        });

        const items = result.resources.map((r: any) => ({
            id: r.public_id,
            title: r.context?.custom?.title || 'Bez nazw',
            object: r.context?.custom?.object || '',
            description: r.context?.custom?.description || '',
            date: r.context?.custom?.date || r.created_at.split('T')[0],
            imageUrl: r.secure_url,
            thumbnailUrl: cloudinary.url(r.public_id, { width: 400, height: 300, crop: 'fill', quality: 'auto', fetch_format: 'auto' }),
            tags: r.tags || [],
            gear: r.context?.custom?.gear || '',
            exposure: r.context?.custom?.exposure || '',
            iso: r.context?.custom?.iso || '',
            createdAt: r.created_at,
        }));

        // sort newest first
        return items.sort((a: GalleryItem, b: GalleryItem) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    } catch (e) {
        console.error('[Cloudinary] fetch error', e);
        return [];
    }
}
