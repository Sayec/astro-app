export interface DSOVisibility {
    maxAltitude: number;
    isCircumpolar: boolean;
    neverRises: boolean;
    bestMonths: number[];
    currentAltitude: number;
    isAboveHorizon: boolean;
    bestSeason: string;
    recommendation: string;
}

export interface DSOSearchResult {
    id: string;
    name: string;
    type: string;
    typeId: string;
    subType: string | null;
    constellation: string;
    constellationShort: string;
    ra: { hours: number; string: string };
    dec: { degrees: number; string: string };
    alternativeNames: string[];
    visibility: DSOVisibility;
}
