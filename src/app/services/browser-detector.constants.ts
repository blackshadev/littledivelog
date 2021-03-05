export enum OS {
    WindowsPhone = 'windows phone',
    Window = 'windows',
    Linux = 'linux',
    Unix = 'unix',
    MacOS = 'macos',
    Other = 'other',
}
export const allOSes = [
    OS.WindowsPhone,
    OS.Window,
    OS.Linux,
    OS.MacOS,
    OS.Unix,
    OS.Other,
];

export const OS_Rules: {
    [os in OS]: { positive?: RegExp; negative?: RegExp };
} = {
    [OS.WindowsPhone]: { positive: /\bIEMobile\b|\bWindows Phone\b/i },
    [OS.Linux]: { positive: /\bLinux\b/ },
    [OS.Window]: { positive: /\bwindows\b/i, negative: /\bWindows Phone\b/ },
    [OS.MacOS]: {
        positive: /\bMac OS\b/i,
        negative: /\biPhone\b|\bWindows Phone\b/,
    },
    [OS.Unix]: { positive: /\bunix\b/i },
    [OS.Other]: {},
};

export function detectOS(ua: string) {
    for (const os of allOSes) {
        if (testRule(ua, OS_Rules[os])) {
            return os;
        }
    }
    return OS.Other;
}

export function testRule(
    txt: string,
    re: { positive?: RegExp; negative?: RegExp },
): boolean {
    return re.positive?.test(txt) === true && re.negative?.test(txt) !== true;
}
