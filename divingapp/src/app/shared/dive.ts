
function formatNumber(n: number) {
    return ('0' + n).slice(-2);
}

export interface ITag {
    color: string;
    text: string;
}

export type TSample = any;

export class Duration {
    hours: number;
    minutes: number;
    seconds: number;

    static Parse(str: String): Duration {
        const parts = str.split(':').map((s) => parseInt(s, 10));
        const d = new Duration(...parts);
        return d;
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

}

export class Dive implements IDive {
    id: number;
    date: Date;
    divetime: Duration;
    maxDepth: number;
    samples: TSample[];
    place: { name: string; country: string; };
    tanks: ITank[];
    tags: ITag[];
    buddies: ITag[];


    get placeStr() { return (this.place.name || '') + (this.place.country ? (', ' + this.place.country) : ''); }

    static New() {
        const dive = new Dive;
        dive.date = new Date();
        dive.divetime = new Duration(0);
        dive.maxDepth = 0;
        dive.samples = [];
        dive.place = { name: '', country: '' };
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
        dive.place = { name: '', country: '' };
        dive.tags = [];
        dive.buddies = [];
        dive.tanks = [];

        return dive;
    }

    static Parse(d: IDive): Dive {
        const dive = new Dive;
        dive.id = d.id;
        dive.date = new Date(<string>d.date);
        dive.divetime = Duration.Parse(<string>d.divetime);
        dive.maxDepth = d.maxDepth;
        dive.samples = d.samples;
        dive.place = {
            name: d.place.name || '',
            country: d.place.country || ''
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

    static ParseAll(arr: IDive[]): Dive[] {
        return arr.map(d => Dive.Parse(d));
    }

    toJSON(): IDive {
        return {
            id: this.id,
            date: this.date.toISOString(),
            divetime: this.divetime.toString(),
            maxDepth: this.maxDepth,
            samples: this.samples,
            place: this.place,
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
        start: number;
        end: number;
    };
}

export interface IDive {
    id: number;
    date: Date|string;
    divetime: Duration|string;
    maxDepth: number;
    samples: any[];
    place: {
        name: string;
        country: string;
    };
    tanks: ITank[];
    buddies: ITag[];
    tags: ITag[]
}

export interface IDiveRecordDC {
    Date: string;
    DiveTime: string;
    MaxDepth: number;
    Samples?: ISample[];
}

type ISample = any;
