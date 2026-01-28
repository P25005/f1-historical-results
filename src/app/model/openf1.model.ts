export interface OpenF1Session {
    session_key: number;
    meeting_key: number;
    circuit_key: number;
    circuit_short_name: string;
    country_name: string;
    country_key: number;
    location: string;
    session_name: string;
    session_type: string; // "Race", "Qualifying", etc.
    date_start: string;
    date_end: string;
    year: number;
}

export interface OpenF1Driver {
    driver_number: number;
    meeting_key: number;
    session_key: number;
    full_name: string;
    name_acronym: string;
    team_name: string;
    team_colour: string;
    headshot_url: string;
    country_code: string;
}

export interface OpenF1Position {
    session_key: number;
    meeting_key: number;
    driver_number: number;
    position: number;
    date: string;
}

export interface OpenF1Weather {
    session_key: number;
    meeting_key: number;
    date: string;
    air_temperature: number;
    humidity: number;
    pressure: number;
    rainfall: number;
    track_temperature: number;
    wind_direction: number;
    wind_speed: number;
}

export interface OpenF1Lap {
    meeting_key: number;
    session_key: number;
    driver_number: number;
    lap_number: number;
    i1_speed: number;
    i2_speed: number;
    st_speed: number;
    lap_duration: number;
    is_pit_out_lap: boolean;
}
