'use server';

import { v2 as cloudinary } from 'cloudinary';
import { saveGalleryItem, deleteGalleryItem } from '@/lib/gallery';
import type { GalleryItem } from '@/types';

export async function getCloudinarySignature(adminKey: string) {
    if (!adminKey || adminKey !== process.env.ADMIN_KEY) {
        throw new Error('Nieautoryzowany dostęp (błędne hasło admina)');
    }

    const timestamp = Math.round((new Date).getTime() / 1000);
    const params = {
        timestamp,
        folder: 'astro-view',
    };

    const signature = cloudinary.utils.api_sign_request(
        params,
        process.env.CLOUDINARY_API_SECRET as string
    );

    return {
        signature,
        timestamp,
        cloudName: process.env.CLOUDINARY_CLOUD_NAME,
        apiKey: process.env.CLOUDINARY_API_KEY,
    };
}

export async function saveGalleryItemAction(item: GalleryItem, adminKey: string) {
    if (!adminKey || adminKey !== process.env.ADMIN_KEY) {
        throw new Error('Nieautoryzowany dostęp (błędne hasło admina)');
    }
    
    await saveGalleryItem(item);
    return item;
}
