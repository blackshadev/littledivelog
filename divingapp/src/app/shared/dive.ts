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

export class Dive implements IDive {
    id: number;
    date: Date;
    divetime: Duration;
    maxDepth: number;
    samples: any[];
    place: { name: string; country: string; };


    get placeStr() { return (this.place.name || "") + (this.place.country ? (", " + this.place.country) : ""); }


    toJSON() : IDive {
        return {
            id: this.id,
            date: this.date.toISOString(),
            divetime: this.divetime.toString(),
            maxDepth: this.maxDepth,
            samples: this.samples,
            place: this.place
        }
    }

    static ParseDC(d: IDiveRecordDC, id?: number) : Dive {
        let dive = new Dive;
        dive.id = id;
        dive.date = new Date(d.Date);
        dive.divetime = Duration.Parse(d.DiveTime);
        dive.maxDepth = d.MaxDepth;
        dive.samples = d.Samples;
        dive.place = { name: "", country: "" };
        
        return dive;
    }

    static Parse(d: IDive) : Dive {
        let dive = new Dive;
        dive.id = d.id;
        dive.date = new Date(<string>d.date);
        dive.divetime = Duration.Parse(<string>d.divetime);
        dive.maxDepth = d.maxDepth;
        dive.samples = d.samples;
        dive.place = {
            name: d.place.name || "",
            country: d.place.country || ""
        };
        return dive;
    }

    static ParseAllDC(arr: IDiveRecordDC[]) : Dive[] {
        let iX = 0;
        return arr.map((d) => Dive.ParseDC(d, iX++));
    }

    static ParseAll(arr: IDive[]): Dive[] {
        return arr.map(d => Dive.Parse(d));
    }
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

}

export interface IDiveRecordDC {
    Date: string;
    DiveTime: string;
    MaxDepth: number;
    Samples?: ISample[]
}

type ISample = any;
