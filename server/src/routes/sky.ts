import { Router } from 'express';
import { getMoonPhase } from '../services/moonPhase.js';
import type { SkyData } from '../types.js';

const router = Router();

router.get('/', async (req, res) => {
    try {
        const lat = req.query.lat as string || process.env.DEFAULT_LAT || '52.23';
        const lon = req.query.lon as string || process.env.DEFAULT_LON || '21.01';

        // Get sunrise/sunset from Open-Meteo (free, no key needed)
        const meteoUrl = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&daily=sunrise,sunset&timezone=auto&forecast_days=1`;
        console.log(`[OpenMeteo] Fetching: ${meteoUrl}`);

        const response = await fetch(meteoUrl);
        if (!response.ok) {
            throw new Error(`Open-Meteo API error: ${response.status}`);
        }

        const meteoData = await response.json() as {
            daily: { sunrise: string[]; sunset: string[] };
        };

        const sunrise = meteoData.daily.sunrise[0];
        const sunset = meteoData.daily.sunset[0];

        // Calculate dark hours (approximate astronomical twilight ~1.5h after/before)
        const sunsetDate = new Date(sunset);
        const sunriseDate = new Date(sunrise);
        const darkStart = new Date(sunsetDate.getTime() + 90 * 60 * 1000); // +1.5h
        const darkEnd = new Date(sunriseDate.getTime() - 90 * 60 * 1000);   // -1.5h

        // Day length
        const dayLengthMs = sunsetDate.getTime() - sunriseDate.getTime();
        const dayLengthHours = Math.round(dayLengthMs / (1000 * 60 * 60) * 10) / 10;

        // Moon phase (calculated, no API needed)
        const moon = getMoonPhase(new Date());

        const skyData: SkyData = {
            moon,
            sunrise: sunrise.split('T')[1] || sunrise,
            sunset: sunset.split('T')[1] || sunset,
            dayLengthHours,
            darkHoursStart: darkStart.toTimeString().slice(0, 5),
            darkHoursEnd: darkEnd.toTimeString().slice(0, 5),
        };

        res.json(skyData);
    } catch (error) {
        console.error('[Sky] Error:', error);
        res.status(500).json({ error: 'Failed to fetch sky data' });
    }
});

export default router;
