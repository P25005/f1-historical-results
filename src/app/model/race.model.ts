export interface Location {
    lat: string;
    long: string;
    locality: string;
    country: string;
}

export interface Circuit {
    circuitId: string;
    url: string;
    circuitName: string;
    Location: Location;
}


import { Constructor, Driver } from './driver.model';

export interface FastestLap {
    rank: string;
    lap: string;
    Time: { time: string };
    AverageSpeed: { units: string; speed: string };
}

export interface RaceResult {
    number: string;
    position: string;
    points: string;
    Driver: Driver;
    Constructor: Constructor;
    grid: string;
    laps: string;
    status: string;
    FastestLap?: FastestLap;
}

export interface Race {
    season: string;
    // número de la cursa dins la temporada
    round: string;
    url: string;
    raceName: string;
    Circuit: Circuit;
    date: string;
    time: string;
    Results?: RaceResult[];
}
