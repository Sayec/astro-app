import { Router } from 'express';
import { calculateVisibility } from '../services/dsoVisibility.js';
import { getMoonPhase } from '../services/moonPhase.js';

const router = Router();

// Popular DSO catalog with RA (hours) and Dec (degrees)
const DSO_CATALOG = [
    { id: 'M42',   name: 'Wielka Mgławica w Orionie', type: 'Mgławica',   emoji: '🌌', ra: 5.588, dec: -5.39 },
    { id: 'M31',   name: 'Galaktyka Andromedy',       type: 'Galaktyka',  emoji: '🌀', ra: 0.712, dec: 41.27 },
    { id: 'M45',   name: 'Plejady',                   type: 'Gromada',    emoji: '✨', ra: 3.787, dec: 24.12 },
    { id: 'M81',   name: 'Galaktyka Bodego',          type: 'Galaktyka',  emoji: '🌀', ra: 9.926, dec: 69.07 },
    { id: 'M82',   name: 'Galaktyka Cygaro',          type: 'Galaktyka',  emoji: '🌀', ra: 9.926, dec: 69.68 },
    { id: 'M13',   name: 'Gromada Herkulesa',         type: 'Gromada',    emoji: '✨', ra: 16.695, dec: 36.46 },
    { id: 'M57',   name: 'Mgławica Pierścień',        type: 'Mgławica',   emoji: '🌌', ra: 18.893, dec: 33.03 },
    { id: 'M27',   name: 'Mgławica Hantel',           type: 'Mgławica',   emoji: '🌌', ra: 19.993, dec: 22.72 },
    { id: 'M1',    name: 'Mgławica Krab',             type: 'Mgławica',   emoji: '🌌', ra: 5.575, dec: 22.01 },
    { id: 'M51',   name: 'Galaktyka Wir',             type: 'Galaktyka',  emoji: '🌀', ra: 13.498, dec: 47.20 },
    { id: 'NGC7000', name: 'Mgławica Ameryka Pn.',    type: 'Mgławica',   emoji: '🌌', ra: 20.988, dec: 44.33 },
    { id: 'M33',   name: 'Galaktyka Trójkąta',        type: 'Galaktyka',  emoji: '🌀', ra: 1.564, dec: 30.66 },
    { id: 'M101',  name: 'Galaktyka Wiatraczek',      type: 'Galaktyka',  emoji: '🌀', ra: 14.053, dec: 54.35 },
    { id: 'M104',  name: 'Galaktyka Sombrero',        type: 'Galaktyka',  emoji: '🌀', ra: 12.666, dec: -11.62 },
    { id: 'M16',   name: 'Mgławica Orzeł',            type: 'Mgławica',   emoji: '🌌', ra: 18.314, dec: -13.79 },
    { id: 'M8',    name: 'Mgławica Laguna',           type: 'Mgławica',   emoji: '🌌', ra: 18.063, dec: -24.38 },
    { id: 'M20',   name: 'Mgławica Trójlistna',       type: 'Mgławica',   emoji: '🌌', ra: 18.043, dec: -23.03 },
    { id: 'M97',   name: 'Mgławica Sowa',             type: 'Mgławica',   emoji: '🌌', ra: 11.248, dec: 55.02 },
    { id: 'M64',   name: 'Galaktyka Czarne Oko',      type: 'Galaktyka',  emoji: '🌀', ra: 12.944, dec: 21.68 },
    { id: 'NGC2244', name: 'Mgławica Rozeta',         type: 'Mgławica',   emoji: '🌌', ra: 6.532, dec: 4.95 },
    { id: 'M35',   name: 'Gromada otwarta w Bliźniętach', type: 'Gromada', emoji: '✨', ra: 6.148, dec: 24.33 },
    { id: 'NGC869', name: 'Podwójna Gromada Perseusza', type: 'Gromada', emoji: '✨', ra: 2.332, dec: 57.13 },
    { id: 'M44',   name: 'Żłóbek (Praesepe)',         type: 'Gromada',    emoji: '✨', ra: 8.669, dec: 19.67 },
    { id: 'IC1396', name: 'Mgławica Trąba Słonia',    type: 'Mgławica',   emoji: '🌌', ra: 21.616, dec: 57.50 },
    { id: 'M78',   name: 'Mgławica refleksyjna',      type: 'Mgławica',   emoji: '🌌', ra: 5.779, dec: 0.08 },
    { id: 'NGC6992', name: 'Mgławica Welon (wsch.)',  type: 'Mgławica',   emoji: '🌌', ra: 20.823, dec: 31.72 },
    { id: 'M3',    name: 'Gromada kulista w Psach Gończych', type: 'Gromada', emoji: '✨', ra: 13.703, dec: 28.38 },
    { id: 'M5',    name: 'Gromada kulista w Wężu',    type: 'Gromada',    emoji: '✨', ra: 15.309, dec: 2.08 },
    { id: 'NGC6960', name: 'Mgławica Welon (zach.)',  type: 'Mgławica',   emoji: '🌌', ra: 20.757, dec: 30.72 },
];

interface TopObjectResult {
    id: string;
    name: string;
    type: string;
    emoji: string;
    rating: number;       // 1-5 stars
    reason: string;       // Polish explanation
    maxAltitude: number;
    currentAltitude: number;
    isAboveHorizon: boolean;
    bestSeason: string;
}

function buildReason(
    moonIllum: number,
    maxAlt: number,
    currentAlt: number,
    isAboveHorizon: boolean,
    isInBestPeriod: boolean,
): string {
    const parts: string[] = [];

    if (moonIllum <= 20) parts.push('Ciemna noc (niska faza Księżyca)');
    else if (moonIllum <= 50) parts.push('Umiarkowane światło Księżyca');
    else parts.push('Silna poświata Księżyca');

    if (isAboveHorizon) {
        parts.push(`obiekt teraz na wys. ${Math.round(currentAlt)}°`);
    } else {
        parts.push(`maks. wys. ${Math.round(maxAlt)}°`);
    }

    if (isInBestPeriod) parts.push('teraz idealny sezon');

    return parts.join(', ');
}

router.get('/', async (req, res) => {
    try {
        const lat = parseFloat(req.query.lat as string) || parseFloat(process.env.DEFAULT_LAT || '52.23');
        const lon = parseFloat(req.query.lon as string) || parseFloat(process.env.DEFAULT_LON || '21.01');

        const moon = getMoonPhase(new Date());
        const moonIllum = moon.illumination;
        const now = new Date();
        const currentMonth = now.getMonth() + 1;

        const scored: (TopObjectResult & { score: number })[] = [];

        for (const obj of DSO_CATALOG) {
            const vis = calculateVisibility(obj.ra, obj.dec, lat, lon);

            if (vis.neverRises || vis.maxAltitude < 10) continue;

            const isInBestPeriod = vis.bestMonths.includes(currentMonth);

            // Scoring (0-100)
            let score = 0;

            // Max altitude bonus (0-30): higher is better
            score += Math.min(30, vis.maxAltitude * 0.4);

            // Current altitude bonus (0-25): if above horizon and high
            if (vis.isAboveHorizon) {
                score += Math.min(25, Math.max(0, vis.currentAltitude) * 0.5);
            }

            // Moon penalty/bonus (0-25): lower illumination = better for DSO
            score += (100 - moonIllum) * 0.25;

            // Season bonus (0-20)
            if (isInBestPeriod) score += 20;

            // Convert score to 1-5 stars
            let rating: number;
            if (score >= 75) rating = 5;
            else if (score >= 60) rating = 4;
            else if (score >= 45) rating = 3;
            else if (score >= 30) rating = 2;
            else rating = 1;

            const reason = buildReason(moonIllum, vis.maxAltitude, vis.currentAltitude, vis.isAboveHorizon, isInBestPeriod);

            scored.push({
                id: obj.id,
                name: obj.name,
                type: obj.type,
                emoji: obj.emoji,
                rating,
                reason,
                maxAltitude: Math.round(vis.maxAltitude),
                currentAltitude: Math.round(vis.currentAltitude),
                isAboveHorizon: vis.isAboveHorizon,
                bestSeason: vis.bestSeason,
                score,
            });
        }

        // Sort by score desc, take top 6
        scored.sort((a, b) => b.score - a.score);
        const top = scored.slice(0, 6).map(({ score, ...rest }) => rest);

        res.json({ objects: top, moonIllumination: moonIllum });
    } catch (error) {
        console.error('[TopObjects] Error:', error);
        res.status(500).json({ error: 'Failed to compute top objects' });
    }
});

export default router;
