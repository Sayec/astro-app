import { Router } from 'express';
import type { AstroWeatherResponse } from '../types.js';

const router = Router();

// Cache weather data for 3 hours (7Timer updates ~every 6h)
let weatherCache: { data: AstroWeatherResponse; timestamp: number; key: string } | null = null;
const CACHE_DURATION = 3 * 60 * 60 * 1000; // 3h in ms

router.get('/', async (req, res) => {
    try {
        const lat = req.query.lat as string || process.env.DEFAULT_LAT || '52.23';
        const lon = req.query.lon as string || process.env.DEFAULT_LON || '21.01';
        const cacheKey = `${lat}_${lon}`;

        // Check cache
        if (weatherCache && weatherCache.key === cacheKey && Date.now() - weatherCache.timestamp < CACHE_DURATION) {
            return res.json(weatherCache.data);
        }

        const url = `http://www.7timer.info/bin/api.pl?product=astro&lon=${lon}&lat=${lat}&output=json`;
        console.log(`[7Timer] Fetching: ${url}`);

        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`7Timer API error: ${response.status}`);
        }

        const data = await response.json() as AstroWeatherResponse;

        // Cache the result
        weatherCache = { data, timestamp: Date.now(), key: cacheKey };

        res.json(data);
    } catch (error) {
        console.error('[7Timer] Error:', error);
        res.status(500).json({ error: 'Failed to fetch astro weather data' });
    }
});

export default router;
