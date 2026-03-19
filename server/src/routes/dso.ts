import { Router } from 'express';
import { calculateVisibility } from '../services/dsoVisibility.js';

const router = Router();

// Build auth string for AstronomyAPI
function getAuthString(): string {
    const appId = process.env.ASTRONOMY_APP_ID || '';
    const appSecret = process.env.ASTRONOMY_APP_SECRET || '';
    return Buffer.from(`${appId}:${appSecret}`).toString('base64');
}

interface AstronomyAPISearchResult {
    id: string;
    name: string;
    type: { id: string; name: string };
    subType?: { id: string };
    crossIdentification: Array<{ name: string; catalogId: string | null }>;
    position: {
        equatorial: {
            rightAscension: { hours: string; string: string };
            declination: { degrees: string; string: string };
        };
        constellation?: { id: string; short: string; name: string };
    };
}

// GET /api/dso/search?q=<term>&lat=<lat>&lon=<lon>
router.get('/search', async (req, res) => {
    try {
        const term = (req.query.q as string || '').trim();
        if (!term || term.length < 2) {
            return res.json({ results: [] });
        }

        const lat = parseFloat(req.query.lat as string) || parseFloat(process.env.DEFAULT_LAT || '52.23');
        const lon = parseFloat(req.query.lon as string) || parseFloat(process.env.DEFAULT_LON || '21.01');

        const authString = getAuthString();
        const searchUrl = `https://api.astronomyapi.com/api/v2/search?term=${encodeURIComponent(term)}&match_type=fuzzy&limit=8`;

        console.log(`[DSO Search] Searching for: "${term}"`);

        const response = await fetch(searchUrl, {
            headers: {
                'Authorization': `Basic ${authString}`,
            },
        });

        if (!response.ok) {
            const errText = await response.text();
            console.error(`[DSO Search] API error: ${response.status}`, errText);
            throw new Error(`AstronomyAPI error: ${response.status}`);
        }

        const apiData = await response.json() as {
            data: AstronomyAPISearchResult[];
        };

        const results = (apiData.data || []).map((item: AstronomyAPISearchResult) => {
            const raHours = parseFloat(item.position.equatorial.rightAscension.hours);
            const decDeg = parseFloat(item.position.equatorial.declination.degrees);

            const visibility = calculateVisibility(raHours, decDeg, lat, lon);

            // Build all names list
            const allNames = item.crossIdentification
                .map(ci => ci.name)
                .filter((n, i, arr) => arr.indexOf(n) === i); // deduplicate

            return {
                id: item.id,
                name: item.name,
                type: item.type.name,
                typeId: item.type.id,
                subType: item.subType?.id || null,
                constellation: item.position.constellation?.name || '—',
                constellationShort: item.position.constellation?.short || '—',
                ra: {
                    hours: raHours,
                    string: item.position.equatorial.rightAscension.string,
                },
                dec: {
                    degrees: decDeg,
                    string: item.position.equatorial.declination.string,
                },
                alternativeNames: allNames,
                visibility,
            };
        });

        res.json({ results });
    } catch (error) {
        console.error('[DSO Search] Error:', error);
        res.status(500).json({ error: 'Failed to search objects' });
    }
});

export default router;
