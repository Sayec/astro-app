import { Redis } from '@upstash/redis';
import type { GalleryItem } from './types';

// Upstash Redis client - requires UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN env vars
export const redis = new Redis({
    url: process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL!,
    token: process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN!,
});

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
