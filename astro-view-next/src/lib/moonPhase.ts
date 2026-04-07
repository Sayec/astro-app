import type { MoonPhaseData } from './types';

const KNOWN_NEW_MOON = new Date('2000-01-06T18:14:00Z');
const LUNAR_CYCLE = 29.53058770576; // days

/**
 * Get the phase ratio (0-1) for a given date.
 * 0 / 1 = new moon, 0.5 = full moon.
 */
function getPhaseRatio(date: Date): number {
    const daysSinceKnown = (date.getTime() - KNOWN_NEW_MOON.getTime()) / (1000 * 60 * 60 * 24);
    const cycles = daysSinceKnown / LUNAR_CYCLE;
    return cycles - Math.floor(cycles);
}

/**
 * Find the next occurrence of a target phase (0 = new moon, 0.5 = full moon)
 * by stepping forward from `start` and narrowing with bisection.
 */
function findNextPhase(start: Date, targetRatio: number): Date {
    const MS_PER_DAY = 86_400_000;

    // Step forward day by day to find a bracket where the phase crosses the target
    let prev = start;
    let prevDist = phaseDist(getPhaseRatio(prev), targetRatio);

    for (let d = 1; d <= 35; d++) {
        const cur = new Date(start.getTime() + d * MS_PER_DAY);
        const curDist = phaseDist(getPhaseRatio(cur), targetRatio);

        // We crossed the target when distance starts growing again after shrinking to near-zero
        if (curDist > prevDist && prevDist < 0.1) {
            // Bisect between prev and cur for higher precision
            return bisect(prev, cur, targetRatio);
        }
        prev = cur;
        prevDist = curDist;
    }

    // Fallback — just return the closest we found
    return prev;
}

/** Circular distance between two phase ratios (both in 0-1) */
function phaseDist(a: number, b: number): number {
    const d = Math.abs(a - b);
    return Math.min(d, 1 - d);
}

/** Binary-search to refine the moment of closest approach to target phase */
function bisect(lo: Date, hi: Date, target: number): Date {
    for (let i = 0; i < 20; i++) {
        const mid = new Date((lo.getTime() + hi.getTime()) / 2);
        const midDist = phaseDist(getPhaseRatio(mid), target);
        const loDist = phaseDist(getPhaseRatio(lo), target);
        if (loDist < midDist) {
            hi = mid;
        } else {
            lo = mid;
        }
    }
    return new Date((lo.getTime() + hi.getTime()) / 2);
}

function formatDatePl(d: Date): string {
    return d.toLocaleDateString('pl-PL', { day: 'numeric', month: 'long', year: 'numeric' });
}

/**
 * Calculate moon phase for a given date using a simplified algorithm.
 * Based on the Trig method from astronomical calculations.
 */
export function getMoonPhase(date: Date = new Date()): MoonPhaseData {
    const phaseRatio = getPhaseRatio(date);
    const ageDays = phaseRatio * LUNAR_CYCLE;

    // Calculate illumination (simplified sinusoidal approximation)
    const illumination = Math.round((1 - Math.cos(2 * Math.PI * ageDays / LUNAR_CYCLE)) / 2 * 100);

    // Determine phase name and emoji
    const { phase, emoji } = getPhaseNameAndEmoji(ageDays, LUNAR_CYCLE);

    // Calculate next full and new moon
    const nextFullMoon = findNextPhase(date, 0.5);
    const nextNewMoon = findNextPhase(date, 0.0);

    // Days until each
    const msPerDay = 86_400_000;
    const daysToFull = Math.round((nextFullMoon.getTime() - date.getTime()) / msPerDay);
    const daysToNew = Math.round((nextNewMoon.getTime() - date.getTime()) / msPerDay);

    return {
        phase,
        illumination,
        ageDays: Math.round(ageDays * 10) / 10,
        emoji,
        nextFullMoon: formatDatePl(nextFullMoon),
        nextNewMoon: formatDatePl(nextNewMoon),
        daysToFullMoon: daysToFull,
        daysToNewMoon: daysToNew,
    };
}

function getPhaseNameAndEmoji(ageDays: number, lunarCycle: number): { phase: string; emoji: string } {
    const phaseRatio = ageDays / lunarCycle;

    if (phaseRatio < 0.0339) return { phase: 'Nów', emoji: '🌑' };
    if (phaseRatio < 0.2161) return { phase: 'Przybywający sierp', emoji: '🌒' };
    if (phaseRatio < 0.2839) return { phase: 'Pierwsza kwadra', emoji: '🌓' };
    if (phaseRatio < 0.4661) return { phase: 'Przybywający garb', emoji: '🌔' };
    if (phaseRatio < 0.5339) return { phase: 'Pełnia', emoji: '🌕' };
    if (phaseRatio < 0.7161) return { phase: 'Ubywający garb', emoji: '🌖' };
    if (phaseRatio < 0.7839) return { phase: 'Ostatnia kwadra', emoji: '🌗' };
    if (phaseRatio < 0.9661) return { phase: 'Ubywający sierp', emoji: '🌘' };
    return { phase: 'Nów', emoji: '🌑' };
}
