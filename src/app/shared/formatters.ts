export function leftpad(length: number, str: string, char: string = '0') {
    for (let i = str.length; i < length; i++) {
        str = char + str;
    }

    return str;
}

export function divetime(value: number | null): string {
    if (!value) {
        return '00:00:00';
    }
    const t = {
        hh: leftpad(2, Math.floor(value / 3600).toFixed(0), '0'),
        mm: leftpad(2, (Math.floor(value / 60) % 60).toFixed(0), '0'),
        ss: leftpad(2, Math.floor(value % 60).toFixed(0), '0'),
    };

    return `${t.hh}:${t.mm}:${t.ss}`;
}

export function temperature(value: number) {
    return `${value.toFixed(1)}&#2103;`;
}
