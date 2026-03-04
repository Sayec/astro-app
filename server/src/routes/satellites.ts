import { Router } from 'express';
import type { SatelliteResponse, SatellitePass } from '../types.js';

const router = Router();

// Known satellite NORAD IDs
const SATELLITES: Record<string, number> = {
    'ISS': 25544,
    'Hubble': 20580,
    'TIANGONG': 48274,
};

router.get('/', async (req, res) => {
    try {
        const apiKey = process.env.N2YO_API_KEY;
        if (!apiKey) {
            return res.status(500).json({ error: 'N2YO API key not configured' });
        }

        const lat = req.query.lat as string || process.env.DEFAULT_LAT || '52.23';
        const lon = req.query.lon as string || process.env.DEFAULT_LON || '21.01';
        const alt = req.query.alt as string || '100';
        const days = req.query.days as string || '5';
        const minVisibility = req.query.minvis as string || '60'; // min 60 seconds visible

        console.log(`[N2YO] Fetching satellite passes for lat=${lat}, lon=${lon}`);

        // Fetch passes for each known satellite in parallel
        const results = await Promise.allSettled(
            Object.entries(SATELLITES).map(async ([name, noradId]) => {
                const url = `https://api.n2yo.com/rest/v1/satellite/visualpasses/${noradId}/${lat}/${lon}/${alt}/${days}/${minVisibility}/?apiKey=${apiKey}`;

                const response = await fetch(url);
                if (!response.ok) {
                    console.warn(`[N2YO] Failed for ${name}: ${response.status}`);
                    return { name, passes: [] };
                }

                const data = await response.json() as SatelliteResponse;
                const passes = (data.passes || []).map(p => ({
                    ...p,
                    satname: name,
                    satid: noradId,
                }));

                return { name, passes };
            })
        );

        // Merge all passes and sort by start time
        const allPasses: SatellitePass[] = [];
        for (const result of results) {
            if (result.status === 'fulfilled' && result.value.passes) {
                allPasses.push(...result.value.passes);
            }
        }

        allPasses.sort((a, b) => a.startUTC - b.startUTC);

        res.json({
            location: { lat: parseFloat(lat), lon: parseFloat(lon) },
            passes: allPasses,
            count: allPasses.length,
        });
    } catch (error) {
        console.error('[N2YO] Error:', error);
        res.status(500).json({ error: 'Failed to fetch satellite data' });
    }
});

export default router;
