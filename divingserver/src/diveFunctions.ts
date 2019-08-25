import { IDiveSample, IDive } from "./interfaces";

export function max<T extends number | string>(...args: T[]): T {
    let t = args[0];

    for (let iX = 1; iX < args.length; iX++) {
        if (t === null || t < args[iX]) {
            t = args[iX];
        }
    }

    return t;
}

export function min<T extends number | string>(...args: T[]): T {
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
>(obj: K[], key: S, fn: (...args: Array<K[S]>) => K[S]): K[S] {
    if (obj.length < 1) {
        throw new Error("Expected atleast one argument");
    }

    const computerMax = fn(...obj.filter(k => k.computer_id).map(o => o[key]));
    const userMax = fn(...obj.filter(k => !k.computer_id).map(o => o[key]));

    return computerMax !== undefined && computerMax !== null
        ? computerMax
        : userMax;
}

export function combineSample(dst: IDiveSample, ...samples: IDiveSample[]) {
    for (let sample of samples) {
        for (let key of Object.keys(sample)) {
            dst[key] =
                dst[key] === null || dst[key] === undefined
                    ? sample[key]
                    : sample[key];
            if (Array.isArray(dst[key]) && Array.isArray(sample[key])) {
                dst[key].push(...sample[key]);
            }
        }
    }
}

export function mergeSamples(
    ...dives: Array<{ date: string; divetime: number; samples: IDiveSample[] }>
): { date: string; divetime: number; samples: IDiveSample[] } {
    const normDives = dives
        .map(d => ({
            strDate: d.date,
            date: new Date(d.date),
            endDate: new Date(d.date).valueOf() + d.divetime * 1000,
            divetime: d.divetime,
            samples: d.samples,
        }))
        .sort((a, b) => a.date.valueOf() - b.date.valueOf());

    let timeOffset: number = 0;
    const aggrSamples: IDiveSample[] = normDives[0].samples.slice();
    let lastSample = normDives[0].samples[normDives[0].samples.length - 1];

    for (let iX = 1; iX < normDives.length; iX++) {
        const timeDiff =
            (normDives[iX].date.valueOf() -
                normDives[iX - 1].endDate.valueOf()) /
            1000;
        timeOffset = lastSample.Time + timeDiff;

        if (timeDiff < 0) {
            throw new Error(
                "Unable to merge dive sample, some dives seem to overlap",
            );
        }

        // Stitch some surfice time in between
        if (timeDiff < 10) {
            aggrSamples.push({
                Time: timeOffset + Math.floor(timeDiff / 2),
                Depth: 0,
            });
        } else if (timeDiff > 0) {
            aggrSamples.push({
                Time: lastSample.Time + 2,
                Depth: 0,
            });
            aggrSamples.push({
                Time: timeOffset - 2,
                Depth: 0,
            });
        }

        // Combines samples which are on the same time at the start of the dive, to make sure no wonky depth lines occur

        while (
            normDives[iX].samples[0].Time === normDives[iX].samples[1].Time
        ) {
            combineSample(normDives[iX].samples[1], normDives[iX].samples[0]);
            normDives[iX].samples.shift();
        }

        normDives[iX].samples.forEach(s => (s.Time += timeOffset));
        aggrSamples.push(...normDives[iX].samples);
        lastSample = normDives[iX].samples[normDives[iX].samples.length - 1];
    }
    const diveTime: number = lastSample.Time;

    return {
        date: normDives[0].strDate,
        divetime: diveTime,
        samples: aggrSamples,
    };
}
