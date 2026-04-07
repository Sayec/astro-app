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

export interface SatelliteData {
    location: { lat: number; lon: number };
    passes: SatellitePass[];
    count: number;
}
