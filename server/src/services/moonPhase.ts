import type { MoonPhaseData } from '../types.js';

/**
 * Calculate moon phase for a given date using a simplified algorithm.
 * Based on the Trig method from astronomical calculations.
 */
export function getMoonPhase(date: Date = new Date()): MoonPhaseData {
    // Known new moon: January 6, 2000 18:14 UTC
    const knownNewMoon = new Date('2000-01-06T18:14:00Z');
    const lunarCycle = 29.53058770576;  // days

    const daysSinceKnown = (date.getTime() - knownNewMoon.getTime()) / (1000 * 60 * 60 * 24);
    const cycles = daysSinceKnown / lunarCycle;
    const ageDays = (cycles - Math.floor(cycles)) * lunarCycle;

    // Calculate illumination (simplified sinusoidal approximation)
    const illumination = Math.round((1 - Math.cos(2 * Math.PI * ageDays / lunarCycle)) / 2 * 100);

    // Determine phase name and emoji
    const { phase, emoji } = getPhaseNameAndEmoji(ageDays, lunarCycle);

    return {
        phase,
        illumination,
        ageDays: Math.round(ageDays * 10) / 10,
        emoji,
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
