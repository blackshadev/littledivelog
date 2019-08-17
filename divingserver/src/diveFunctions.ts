import { IDiveSample } from "./interfaces";

export function max<T extends number | string>(...args: Array<T>): T {
    let t = args[0];

    for (let iX = 1; iX < args.length; iX++) {
        if (t === null || t < args[iX]) {
            t = args[iX];
        }
    }

    return t;
}

export function min<T extends number | string>(...args: Array<T>): T {
    let t = args[0];

    for (let iX = 1; iX < args.length; iX++) {
        if (t === null || t > args[iX]) {
            t = args[iX];
        }
    }

    return t;
}

export function getComputerPrefered<
    K extends { computer_id?: number },
    S extends keyof K
>(obj: K[], key: S, fn: (...args: K[S][]) => K[S]): K[S] {
    if (obj.length < 1) {
        throw new Error("Expected atleast one argument");
    }

    const computerMax = fn(...obj.filter(k => k.computer_id).map(o => o[key]));
    const userMax = fn(...obj.filter(k => !k.computer_id).map(o => o[key]));

    return computerMax !== undefined && computerMax !== null
        ? computerMax
        : userMax;
}

export function mergeSamples(
    ...dives: Array<{ date: string; divetime: number; samples: IDiveSample[] }>
) {}
