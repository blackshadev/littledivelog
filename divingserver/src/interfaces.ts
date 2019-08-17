export interface ITank {
    volume: number;
    oxygen: number;
    pressure: {
        begin: number;
        end: number;
        type: "bar" | "psi";
    };
}

export interface IBatchDive {
    max_depth: number;
    dive_time: number;
    date: Date;
    tags: string[];
    place: {
        country_code: string;
        country: string;
        name: string;
    };
    buddies: string[];
    tanks: ITank[];
}

export interface IDiveSample {
    Time: number;
    Depth: number;
    Temperature: number;
}

export interface IDive {
    dive_id: number;
    user_id: number;
    date: string;
    divetime: number;
    max_depth: number;
    samples: IDiveSample[];
    country_code: string;
    place_id: number;
    tanks: ITank[];
    computer_id: number;
}

export interface IBuddy {
    buddy_id?: number;
    text: string;
    color: string;
}

export interface ITag {
    tag_id?: number;
    text: string;
    color: string;
}

export interface IPlace {
    place_id?: number;
    name: string;
    country_code: string;
}
