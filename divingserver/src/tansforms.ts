
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
        return `(${tank.volume},${tank.oxygen},\\"(${tank.pressure.begin},${tank.pressure.end},${tank.pressure.type})\\")`;
    }).join('","')}"}`;
}
