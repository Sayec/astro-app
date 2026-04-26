'use server';

import { uploadImage } from '@/lib/cloudinary';
import { saveGalleryItem, deleteGalleryItem } from '@/lib/gallery';
import type { GalleryItem } from '@/types';

export async function uploadGalleryPhotoAction(formData: FormData, adminKey: string): Promise<GalleryItem> {
    if (!adminKey || adminKey !== process.env.ADMIN_KEY) {
        throw new Error('Nieautoryzowany dostęp (błędne hasło admina)');
    }

    const file = formData.get('image') as File | null;
    if (!file) throw new Error('Brak pliku zdjęcia');

    const title = formData.get('title') as string;
    const object = formData.get('object') as string;
    if (!title || !object) throw new Error('Tytuł i obiekt są wymagane');

    const description = (formData.get('description') as string) || '';
    const date = (formData.get('date') as string) || new Date().toISOString().split('T')[0];
    const gear = (formData.get('gear') as string) || '';
    const exposure = (formData.get('exposure') as string) || '';
    const iso = (formData.get('iso') as string) || '';
    const tagsRaw = formData.get('tags') as string | null;
    let tags: string[] = [];
    try { tags = tagsRaw ? JSON.parse(tagsRaw) : []; } catch { tags = []; }

    try {
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
        return newItem;
    } catch (e: any) {
        throw new Error('Błąd wgrywania pliku na serwer: ' + e.message);
    }
}
