/**
 * DSO Visibility Calculator
 * Computes object visibility based on RA/Dec and observer location.
 * All calculations use standard spherical astronomy formulas.
 */

export interface VisibilityData {
    /** Maximum altitude the object can reach (degrees) */
    maxAltitude: number;
    /** Whether the object is circumpolar (always above horizon) */
    isCircumpolar: boolean;
    /** Whether the object never rises at this latitude */
    neverRises: boolean;
    /** Best months for observation (1-12) */
    bestMonths: number[];
    /** Current approximate altitude (degrees, can be negative) */
    currentAltitude: number;
    /** Whether the object is currently above the horizon */
    isAboveHorizon: boolean;
    /** Best observation season name */
    bestSeason: string;
    /** Observation recommendation */
    recommendation: string;
}

const MONTH_NAMES_PL = [
    'Styczeń', 'Luty', 'Marzec', 'Kwiecień', 'Maj', 'Czerwiec',
    'Lipiec', 'Sierpień', 'Wrzesień', 'Październik', 'Listopad', 'Grudzień'
];

function degToRad(deg: number): number {
    return deg * Math.PI / 180;
}

function radToDeg(rad: number): number {
    return rad * 180 / Math.PI;
}

/**
 * Calculate Local Sidereal Time (LST) in hours
 */
function getLocalSiderealTime(date: Date, lonDeg: number): number {
    const jd = (date.getTime() / 86400000) + 2440587.5;

    const T = (jd - 2451545.0) / 36525.0;
    let gmst = 280.46061837 + 360.98564736629 * (jd - 2451545.0)
        + 0.000387933 * T * T - T * T * T / 38710000.0;

    gmst = ((gmst % 360) + 360) % 360; // normalize to 0-360
    let lst = gmst + lonDeg;
    lst = ((lst % 360) + 360) % 360;
    return lst / 15.0; // convert to hours
}

/**
 * Calculate altitude of an object given its RA/Dec, observer location, and LST
 */
function calculateAltitude(raHours: number, decDeg: number, latDeg: number, lstHours: number): number {
    const ha = (lstHours - raHours) * 15; // hour angle in degrees
    const latRad = degToRad(latDeg);
    const decRad = degToRad(decDeg);
    const haRad = degToRad(ha);

    const sinAlt = Math.sin(latRad) * Math.sin(decRad) +
        Math.cos(latRad) * Math.cos(decRad) * Math.cos(haRad);

    return radToDeg(Math.asin(Math.min(1, Math.max(-1, sinAlt))));
}

/**
 * Calculate the best months for observing a DSO based on its RA.
 * An object culminates at midnight when the Sun is at RA_opposite = RA + 12h.
 * Sun RA ≈ 0h at vernal equinox (~March 21), moving ~2h/month.
 * So: peak_month = ((RA + 12) mod 24) / 2 + 3  (1-indexed months)
 */
function getBestMonths(raHours: number): number[] {
    // Sun is at RA = (month - 3) * 2 (approximately, where month is 1-indexed)
    // Object transits at midnight when Sun RA = (RA + 12) mod 24
    // So: (month - 3) * 2 = (RA + 12) mod 24
    //     month = ((RA + 12) mod 24) / 2 + 3

    const sunOppositeRA = ((raHours + 12) % 24);
    const peakMonthFloat = sunOppositeRA / 2 + 3; // 1-indexed
    // Wrap around: if > 12, subtract 12
    const peakMonth = ((peakMonthFloat - 1) % 12) + 1; // normalize to 1-12
    const peak = Math.round(peakMonth);
    const peakNorm = peak > 12 ? peak - 12 : (peak < 1 ? peak + 12 : peak);

    // Return 5 months centered on peak
    const months: number[] = [];
    for (let offset = -2; offset <= 2; offset++) {
        let m = peakNorm + offset;
        if (m < 1) m += 12;
        if (m > 12) m -= 12;
        months.push(m);
    }

    return months;
}

function getSeasonName(months: number[]): string {
    const centerMonth = months[Math.floor(months.length / 2)];
    if (centerMonth >= 3 && centerMonth <= 5) return 'Wiosna';
    if (centerMonth >= 6 && centerMonth <= 8) return 'Lato';
    if (centerMonth >= 9 && centerMonth <= 11) return 'Jesień';
    return 'Zima';
}

function getMonthLabel(months: number[]): string {
    return months.map(m => MONTH_NAMES_PL[m - 1]).join(', ');
}

export function calculateVisibility(
    raHours: number,
    decDeg: number,
    latDeg: number,
    lonDeg: number
): VisibilityData {
    // Max altitude = 90 - |lat - dec|
    const maxAltitude = 90 - Math.abs(latDeg - decDeg);

    // Circumpolar check: dec > 90 - |lat| (for northern hemisphere)
    const isCircumpolar = latDeg >= 0
        ? decDeg > (90 - latDeg)
        : decDeg < -(90 + latDeg);

    // Never rises check: dec < -(90 - |lat|) (for northern hemisphere)
    const neverRises = latDeg >= 0
        ? decDeg < -(90 - latDeg)
        : decDeg > (90 + latDeg);

    // Best months
    const bestMonths = getBestMonths(raHours);

    // Current altitude
    const now = new Date();
    const lst = getLocalSiderealTime(now, lonDeg);
    const currentAltitude = Math.round(calculateAltitude(raHours, decDeg, latDeg, lst) * 10) / 10;
    const isAboveHorizon = currentAltitude > 0;

    // Season
    const bestSeason = getSeasonName(bestMonths);

    // Recommendation
    const currentMonth = now.getMonth() + 1; // 1-indexed
    const isInBestPeriod = bestMonths.includes(currentMonth);
    let recommendation: string;

    if (neverRises) {
        recommendation = '❌ Ten obiekt nigdy nie wschodzi na tej szerokości geograficznej.';
    } else if (maxAltitude < 15) {
        recommendation = '⚠️ Obiekt nisko nad horyzontem – trudne warunki obserwacyjne.';
    } else if (isInBestPeriod && isAboveHorizon) {
        recommendation = '🟢 Doskonały czas na obserwację! Obiekt jest teraz widoczny.';
    } else if (isInBestPeriod) {
        recommendation = '🟡 Dobry okres, ale obiekt jest teraz pod horyzontem. Spróbuj w nocy.';
    } else {
        recommendation = `🔵 Najlepszy okres obserwacji: ${getMonthLabel(bestMonths)} (${bestSeason}).`;
    }

    return {
        maxAltitude: Math.round(maxAltitude * 10) / 10,
        isCircumpolar,
        neverRises,
        bestMonths,
        currentAltitude,
        isAboveHorizon,
        bestSeason,
        recommendation,
    };
}
