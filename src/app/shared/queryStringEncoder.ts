export function encodeAsQueryString(params: {
    [key: string]: unknown;
}): string {
    return Object.keys(params)
        .map((k) => encodeAsQueryComponent(k, params[k]))
        .join("&");
}

function isNativeValue(value: unknown): value is number | string | boolean {
    return (
        typeof value === "string" ||
        typeof value === "number" ||
        typeof value === "boolean"
    );
}

function encodeAsQueryComponent(key: string, value: unknown): string {
    if (isNativeValue(value)) {
        return `${encodeURIComponent(key)}=${encodeURIComponent(value)}`;
    }

    if (typeof value === "object" && Array.isArray(value)) {
        return value
            .map(
                (element) =>
                    `${encodeURIComponent(key)}[]=${encodeURIComponent(
                        element,
                    )}`,
            )
            .join("&");
    }

    throw new Error("Unsupported type for query encoding");
}
