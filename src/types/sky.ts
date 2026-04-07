export interface MoonPhaseData {
    phase: string;           // "New Moon", "Waxing Crescent", etc.
    illumination: number;    // 0-100%
    ageDays: number;         // days into lunar cycle
    emoji: string;
    nextFullMoon: string;    // formatted date of next full moon
    nextNewMoon: string;     // formatted date of next new moon
    daysToFullMoon: number;  // days until next full moon
    daysToNewMoon: number;   // days until next new moon
}

export interface SkyData {
    moon: MoonPhaseData;
    sunrise: string;
    sunset: string;
    dayLengthHours: number;
    darkHoursStart: string;  // ~1h after sunset (astronomical twilight)
    darkHoursEnd: string;    // ~1h before sunrise
}
