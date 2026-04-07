import { redis } from './redis';
import type { GalleryItem } from '@/types';

const KEY_PREFIX = 'gallery:';

export async function getAllGalleryItems(): Promise<GalleryItem[]> {
    const keys = await redis.keys(`${KEY_PREFIX}*`);
    if (keys.length === 0) return [];

    const items = await redis.mget<GalleryItem[]>(...keys);
    return items
        .filter((item): item is GalleryItem => item !== null)
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export async function saveGalleryItem(item: GalleryItem): Promise<void> {
    await redis.set(`${KEY_PREFIX}${item.id}`, item);
}

export async function deleteGalleryItem(id: string): Promise<boolean> {
    const deleted = await redis.del(`${KEY_PREFIX}${id}`);
    return deleted > 0;
}
