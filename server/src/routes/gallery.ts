import { Router } from 'express';
import multer from 'multer';
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { uploadImage } from '../services/cloudinary.js';
import type { GalleryItem } from '../types.js';

const router = Router();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 25 * 1024 * 1024 } }); // 25MB max

const __dirname = dirname(fileURLToPath(import.meta.url));
const DATA_DIR = join(__dirname, '../../data');
const GALLERY_FILE = join(DATA_DIR, 'gallery.json');

function loadGallery(): GalleryItem[] {
    if (!existsSync(GALLERY_FILE)) return [];
    try {
        return JSON.parse(readFileSync(GALLERY_FILE, 'utf-8'));
    } catch {
        return [];
    }
}

function saveGallery(items: GalleryItem[]) {
    if (!existsSync(DATA_DIR)) mkdirSync(DATA_DIR, { recursive: true });
    writeFileSync(GALLERY_FILE, JSON.stringify(items, null, 2));
}

// Auth middleware for admin routes
function requireAdmin(req: any, res: any, next: any) {
    const adminKey = req.headers['x-admin-key'] as string;
    if (!adminKey || adminKey !== process.env.ADMIN_KEY) {
        return res.status(401).json({ error: 'Unauthorized' });
    }
    next();
}

// GET all gallery items
router.get('/', (_req, res) => {
    const items = loadGallery();
    res.json(items);
});

// POST new photo (admin only)
router.post('/', requireAdmin, upload.single('image'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No image file provided' });
        }

        if (!process.env.CLOUDINARY_API_SECRET) {
            return res.status(503).json({ error: 'Cloudinary not configured yet (missing API secret)' });
        }

        const { title, object, description, date, gear, exposure, iso, tags } = req.body;

        if (!title || !object) {
            return res.status(400).json({ error: 'Title and object are required' });
        }

        // Parse tags (sent as JSON string from FormData)
        let parsedTags: string[] = [];
        try { parsedTags = tags ? JSON.parse(tags) : []; } catch { parsedTags = []; }

        console.log(`[Gallery] Uploading: ${title} (${object})`);

        const { url, thumbnailUrl } = await uploadImage(req.file.buffer, req.file.originalname);

        const newItem: GalleryItem = {
            id: `photo_${Date.now()}`,
            title,
            object: object || '',
            description: description || '',
            date: date || new Date().toISOString().split('T')[0],
            imageUrl: url,
            thumbnailUrl,
            tags: parsedTags,
            gear: gear || '',
            exposure: exposure || '',
            iso: iso || '',
            createdAt: new Date().toISOString(),
        };

        const gallery = loadGallery();
        gallery.unshift(newItem); // newest first
        saveGallery(gallery);

        console.log(`[Gallery] ✓ Uploaded: ${title}`);
        res.json(newItem);
    } catch (error) {
        console.error('[Gallery] Upload error:', error);
        res.status(500).json({ error: 'Failed to upload image' });
    }
});

// DELETE photo (admin only)
router.delete('/:id', requireAdmin, (req, res) => {
    const gallery = loadGallery();
    const filtered = gallery.filter(item => item.id !== req.params.id);

    if (filtered.length === gallery.length) {
        return res.status(404).json({ error: 'Photo not found' });
    }

    saveGallery(filtered);
    console.log(`[Gallery] ✗ Deleted: ${req.params.id}`);
    res.json({ success: true, remaining: filtered.length });
});

export default router;
