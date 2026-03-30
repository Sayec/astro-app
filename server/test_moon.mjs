// Quick test for moon phase calculation
const KNOWN_NEW_MOON = new Date('2000-01-06T18:14:00Z');
const LUNAR_CYCLE = 29.53058770576;

function getPhaseRatio(date) {
    const daysSinceKnown = (date.getTime() - KNOWN_NEW_MOON.getTime()) / (1000 * 60 * 60 * 24);
    const cycles = daysSinceKnown / LUNAR_CYCLE;
    return cycles - Math.floor(cycles);
}

function phaseDist(a, b) {
    const d = Math.abs(a - b);
    return Math.min(d, 1 - d);
}

function bisect(lo, hi, target) {
    for (let i = 0; i < 20; i++) {
        const mid = new Date((lo.getTime() + hi.getTime()) / 2);
        const midDist = phaseDist(getPhaseRatio(mid), target);
        const loDist = phaseDist(getPhaseRatio(lo), target);
        if (loDist < midDist) hi = mid;
        else lo = mid;
    }
    return new Date((lo.getTime() + hi.getTime()) / 2);
}

function findNextPhase(start, targetRatio) {
    const MS_PER_DAY = 86_400_000;
    let prev = start;
    let prevDist = phaseDist(getPhaseRatio(prev), targetRatio);

    for (let d = 1; d <= 35; d++) {
        const cur = new Date(start.getTime() + d * MS_PER_DAY);
        const curDist = phaseDist(getPhaseRatio(cur), targetRatio);
        if (curDist > prevDist && prevDist < 0.1) {
            return bisect(prev, cur, targetRatio);
        }
        prev = cur;
        prevDist = curDist;
    }
    return prev;
}

const now = new Date();
console.log('Current date:', now.toISOString());
console.log('Phase ratio:', getPhaseRatio(now).toFixed(4));

const nextFull = findNextPhase(now, 0.5);
const nextNew = findNextPhase(now, 0.0);

const msPerDay = 86_400_000;
console.log('Next Full Moon:', nextFull.toLocaleDateString('pl-PL', { day: 'numeric', month: 'long', year: 'numeric' }), 
    `(za ${Math.round((nextFull.getTime() - now.getTime()) / msPerDay)} dni)`);
console.log('Next New Moon:', nextNew.toLocaleDateString('pl-PL', { day: 'numeric', month: 'long', year: 'numeric' }),
    `(za ${Math.round((nextNew.getTime() - now.getTime()) / msPerDay)} dni)`);
