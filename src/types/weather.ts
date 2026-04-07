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
