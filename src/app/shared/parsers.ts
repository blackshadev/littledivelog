export function parseNumberOrNull(value: unknown): number | null {
    if (typeof value === "string") {
        return value ? Number(value) : null;
    }
    if (typeof value === "number") {
        return value;
    }

    return null;
}
