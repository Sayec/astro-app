export interface TopObjectItem {
    id: string;
    name: string;
    type: string;
    emoji: string;
    rating: number;
    reason: string;
    maxAltitude: number;
    currentAltitude: number;
    isAboveHorizon: boolean;
    bestSeason: string;
}

export interface TopObjectsResponse {
    objects: TopObjectItem[];
    moonIllumination: number;
}
