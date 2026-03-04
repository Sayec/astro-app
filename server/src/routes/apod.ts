import { Router } from 'express';
import type { ApodData } from '../types.js';

const router = Router();

router.get('/', async (req, res) => {
    try {
        const apiKey = process.env.NASA_API_KEY || 'DEMO_KEY';
        const date = req.query.date as string || '';

        let url = `https://api.nasa.gov/planetary/apod?api_key=${apiKey}`;
        if (date) {
            url += `&date=${date}`;
        }

        console.log(`[NASA APOD] Fetching for date: ${date || 'today'}`);

        const response = await fetch(url);
        if (!response.ok) {
            const errorBody = await response.text();
            throw new Error(`NASA API error: ${response.status} - ${errorBody}`);
        }

        const data = await response.json() as ApodData;
        res.json(data);
    } catch (error) {
        console.error('[NASA APOD] Error:', error);
        res.status(500).json({ error: 'Failed to fetch NASA APOD' });
    }
});

export default router;
