export class HttpError extends Error {
    constructor(
        public code: number = 500,
        message: string = "Unexpected server error"
    ) {
        super(message);
    }
}