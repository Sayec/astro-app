// ===== Astro Weather (7Timer!) =====
export interface AstroWeatherPoint {
    timepoint: number;       // hours from init
    cloudcover: number;      // 1-9 (1=clear, 9=overcast)
    seeing: number;          // 1-8 (1=best, 8=worst)
    transparency: number;    // 1-8 (1=best, 8=worst)
    lifted_index: number;
    rh2m: number;            // relative humidity
    wind10m: {
        direction: string;
        speed: number;       // 1-8
    };
    temp2m: number;
    prec_type: string;
}

export interface AstroWeatherResponse {
    product: string;
    init: string;
    dataseries: AstroWeatherPoint[];
}

// ===== Tonight's Sky =====
export interface MoonPhaseData {
    phase: string;           // "New Moon", "Waxing Crescent", etc.
    illumination: number;    // 0-100%
    ageDays: number;         // days into lunar cycle
    emoji: string;
}

export interface SkyData {
    moon: MoonPhaseData;
    sunrise: string;
    sunset: string;
    dayLengthHours: number;
    darkHoursStart: string;  // ~1h after sunset (astronomical twilight)
    darkHoursEnd: string;    // ~1h before sunrise
}

// ===== NASA APOD =====
export interface ApodData {
    title: string;
    explanation: string;
    url: string;
    hdurl?: string;
    media_type: string;
    date: string;
    copyright?: string;
}

// ===== Satellites (N2YO) =====
export interface SatellitePass {
    satname: string;
    satid: number;
    startUTC: number;
    startAz: number;
    startAzCompass: string;
    startEl: number;
    maxUTC: number;
    maxAz: number;
    maxAzCompass: string;
    maxEl: number;
    endUTC: number;
    endAz: number;
    endAzCompass: string;
    endEl: number;
    mag: number;
    duration: number;
}

export interface SatelliteResponse {
    info: {
        satname: string;
        satid: number;
        passescount: number;
    };
    passes: SatellitePass[];
}

// ===== Gallery =====
export interface GalleryItem {
    id: string;
    title: string;
    object: string;          // e.g. "M42 Orion Nebula"
    description: string;
    date: string;            // date photo was taken
    imageUrl: string;        // Cloudinary full URL
    thumbnailUrl: string;    // Cloudinary thumbnail URL
    tags?: string[];         // e.g. ["Mgławice", "Widefield"]
    gear?: string;           // telescope, camera
    exposure?: string;       // e.g. "120x30s"
    iso?: string;
    createdAt: string;       // upload timestamp
}
