export function leftpad(length: number, str: string, char: string = '0') {
    for (let i = str.length; i < length; i++) {
        str += char + str;
    }

    return str;
}
