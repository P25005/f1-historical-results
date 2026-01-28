export interface Driver {
    // identificador del pilot, ex: 'max_verstappen'
    driverId: string;
    // número del cotxe
    permanentNumber: string;
    // abreviatura, ex: VER
    code: string;
    url: string;
    givenName: string;
    familyName: string;
    dateOfBirth: string;
    nationality: string;
    full_name?: string;
}

export interface Constructor {
    constructorId: string;
    url: string;
    name: string;
    nationality: string;
    team_name?: string;
}

export interface DriverStanding {
    position: string;
    positionText: string;
    points: string;
    wins: string;
    Driver: Driver;
    Constructors: Constructor[];
    // Flattened fields for UI components
    full_name?: string;
    team_name?: string;
}
