function formatNumber(n: number) {
    return ("0" + n).slice(-2);
}

export class Duration {
    hours: number;
    minutes: number;
    seconds: number;

    constructor(seconds: number);
    constructor(hours: number, minutes: number, seconds: number);
    constructor(minutes: number, seconds: number);
    constructor(...all: number[]);
    constructor(...all: number[]) {
        this.seconds = all.length > 0 ? all[all.length - 1] % 60 : 0;
        this.minutes = all.length > 1 ? ((all[all.length - 1] / 60)|0 + all[all.length - 2]) % 60 : 0;
        this.hours   = all.length > 2 ? (((all[all.length - 1] / 60)|0 + all[all.length - 2]) / 60)|0 + all[all.length - 3] : 0;
    }

    static Parse(str: String): Duration {
        let parts = str.split(":").map((s) => parseInt(s));
        let d = new Duration(...parts);
        return d;
    }

    toString() {
        return `${formatNumber(this.hours)}:${formatNumber(this.minutes)}:${formatNumber(this.seconds)}`;
    }
}

export class Dive  {
    id: number;
    date: Date;
    divetime: Duration;
    maxDepth: number;
    samples: any[];
    placeName: string;
    placeCountry: string;

    get place() { return (this.placeName || "") + (this.placeCountry ? (", " + this.placeCountry) : ""); }

    toJSON() : IDive {
        return {
            Date: this.date.toISOString(),
            DiveTime: this.divetime.toString(),
            MaxDepth: this.maxDepth,
            Samples: this.samples
        }
    }

    static Parse(id: number, d: IDive) : Dive {
        let dive = new Dive;
        dive.id = id;
        dive.date = new Date(d.Date);
        dive.divetime = Duration.Parse(d.DiveTime);
        dive.maxDepth = d.MaxDepth;
        dive.samples = d.Samples;
        return dive;
    }

    static ParseAll(arr: IDive[]) : Dive[] {
        let iX = 0;
        return arr.map((d) => Dive.Parse(iX++, d));
    }
}

export interface IDive {
    Date: string;
    DiveTime: string;
    MaxDepth: number;
    Samples: ISample[]
}

type ISample = any;
