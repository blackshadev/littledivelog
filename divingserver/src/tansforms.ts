export interface ITank {
    volume: number;
    oxygen: number;
    pressure: {
        begin: number;
        end: number;
        type: "bar" | "psi";
    };
}

export function tanksJSONtoType(tanks: ITank[]): string {
    return `{"${tanks
        .map(tank => {
            // tslint:disable-next-line:max-line-length
            return `(${isNullOrRound(tank.volume)},${isNullOrRound(
                tank.oxygen,
            )},\\"(${isNullOrRound(tank.pressure.begin)},${isNullOrRound(
                tank.pressure.end,
            )},${isNull(tank.pressure.type)})\\")`;
        })
        .join('","')}"}`;
}

function isNull(v: any): any {
    return v === null || v === undefined ? "" : v;
}

function isNullOrRound(v: any): any {
    return v === null || v === undefined ? "" : Math.round(v);
}
