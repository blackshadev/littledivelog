
export interface ITank {
    volume: number;
    oxygen: number;
    pressure: {
        begin: number;
        end: number;
        type: "bar"|"psi";
    };
}

export function tanksJSONtoType(tanks: ITank[]): string {
    return `{"${tanks.map((tank) => {
        // tslint:disable-next-line:max-line-length
        return `(${isNull(tank.volume)},${isNull(tank.oxygen)},\\"(${isNull(tank.pressure.begin)},${isNull(tank.pressure.end)},${isNull(tank.pressure.type)})\\")`;
    }).join('","')}"}`;
}


function isNull(v: any): string {
    return v === null || v === undefined ? "" : v;
}