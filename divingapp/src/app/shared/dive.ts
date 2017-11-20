import * as moment from 'moment';

function formatNumber(n: number) {
    return ('0' + n).slice(-2);
}

export interface IPlace {
    place_id?: number;
    country_code: string;
    name: string;
}

export interface IDiveTag {
    color: string;
    text: string;
    tag_id?: number;
}

export interface IBuddy {
    color: string;
    text: string;
    email?: string;
    buddy_id?: number;
}

export enum SampleEventType {
    None = 0,
    Deco = 1,
    RBT,
    Ascent,
    Ceiling,
    Workload,
    Transmitter,
    Violation,
    Bookmark,
    Surface,
    'Safety Stop',
    'Gas Change',
    'Voluntary Safety Stop',
    'Mandatory Safety Stop',
    'Deep Stop',
    'Ceiling (safety stop)',
    'Floor',
    Divetime,
    'Max Depth',
    OLF,
    PO2,
    'Air Time',
    RGBM,
    Heading,
    'Tissue level warning',
    'gaschange2'
}

export enum SampleEventFlag {
    None = 0,
    Begin = 1,
    End = 2,
}

export interface ISampleEvent {
    Name: string;
    Type: SampleEventType;
    Value: number;
    Flags: SampleEventFlag;
}

export interface ISample {
    Time: number;
    Depth: number;
    Temperature: number;
    Events: ISampleEvent[];
}

export class Duration {
    hours: number;
    minutes: number;
    seconds: number;

    static Parse(str: Duration|string|number): Duration {
        if (typeof(str) === 'string') {
                const parts = str.split(':').map((s) => parseInt(s, 10));
                const d = new Duration(...parts);
                return d;
        } else if (typeof(str) === 'number') {
            return new Duration(0, 0, str);
        } else {
            return str;
        }

    }

    constructor(seconds: number);
    // tslint:disable-next-line:unified-signatures
    constructor(minutes: number, seconds: number);
    // tslint:disable-next-line:unified-signatures
    constructor(hours: number, minutes: number, seconds: number);
    constructor(...all: number[]);
    constructor(...all: number[]) {
        this.seconds = all.length > 0 ? all[all.length - 1] % 60 : 0;
        // tslint:disable-next-line:no-bitwise
        this.minutes = all.length > 1 ? ((all[all.length - 1] / 60) | 0 + all[all.length - 2]) % 60 : 0;
        // tslint:disable-next-line:no-bitwise
        this.hours   = all.length > 2 ? (((all[all.length - 1] / 60) | 0 + all[all.length - 2]) / 60) | 0 + all[all.length - 3] : 0;
    }

    toString() {
        return `${formatNumber(this.hours)}:${formatNumber(this.minutes)}:${formatNumber(this.seconds)}`;
    }

    valueOf() {
        return this.seconds + this.minutes * 60 + this.hours * (60 * 60);
    }

}

export class Dive {
    id: number;
    date: Date;
    divetime: Duration;
    maxDepth: number;
    samples: ISample[];
    place: IPlace;
    tanks: ITank[];
    tags: IDiveTag[];
    buddies: IBuddy[];


    get placeStr() { return (this.place.name || '') + (this.place.country_code ? (', ' + this.place.country_code) : ''); }

    static New() {
        const dive = new Dive;
        dive.date = new Date();
        dive.divetime = new Duration(0);
        dive.maxDepth = 0;
        dive.samples = [];
        dive.place = { name: '', country_code: '' };
        dive.tags = [];
        dive.buddies = [];
        dive.tanks = [];

        return dive;
    }

    static ParseDC(d: IDiveRecordDC, id?: number): Dive {
        const dive = new Dive;
        dive.id = id;
        dive.date = new Date(d.Date);
        dive.divetime = Duration.Parse(d.DiveTime);
        dive.maxDepth = d.MaxDepth;
        dive.samples = d.Samples;
        dive.place = { name: '', country_code: '' };
        dive.tags = [];
        dive.buddies = [];
        dive.tanks = [];

        return dive;
    }

    static Parse(d: IDbDive): Dive {
        const dive = new Dive;
        dive.id = d.dive_id;
        dive.date = new Date(<string>d.date);
        dive.divetime = Duration.Parse(d.divetime);
        dive.maxDepth = Number(d.max_depth);
        dive.samples = d.samples;
        d.place = d.place || { name: '', country_code: '' };
        dive.place = {
            name: d.place.name || '',
            country_code: d.place.country_code || ''
        };
        dive.tanks = d.tanks || [];
        dive.buddies = d.buddies || [];
        dive.tags = d.tags || [];
        return dive;
    }

    static ParseAllDC(arr: IDiveRecordDC[]): Dive[] {
        let iX = 0;
        return arr.map((d) => Dive.ParseDC(d, iX++));
    }

    static ParseAll(arr: IDbDive[]): Dive[] {
        return arr.map(d => Dive.Parse(d));
    }

    toJSON(): IDbDive {
        const date = moment(this.date).format('YYYY-MM-DD HH:mm:ss');

        return {
            dive_id: this.id,
            date,
            divetime: this.divetime.valueOf(),
            max_depth: this.maxDepth,
            samples: this.samples,
            place: {
                place_id: this.place.place_id,
                name: this.place.name,
                country_code: this.place.country_code,
            },
            tanks: this.tanks,
            tags: this.tags,
            buddies: this.buddies
        };
    }

}

export interface ITank {
    volume: number;
    oxygen: number;
    pressure: {
        type: 'bar'|'psi';
        begin: number;
        end: number;
    };
}

export interface IDbDive {
    dive_id: number;
    date: Date|string;
    divetime: Duration|string|number;
    tags: IDiveTag[]
    place?: IPlace;
    max_depth?: number;
    samples?: any[];
    tanks?: ITank[];
    buddies?: IDiveTag[];
}

export interface IDiveRecordDC {
    Date: string;
    DiveTime: string;
    MaxDepth: number;
    Samples?: ISample[];
}

