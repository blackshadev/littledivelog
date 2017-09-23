import * as Ajv from "ajv";
import { RequestHandler } from "express";

export class ValidateError extends Error {
    constructor(
        public errors: Ajv.ErrorObject[],
    ) {
        super("Invalid request, body did not match the expected format:\n" + ajv.errorsText(errors));

    }
}

const ajv = new Ajv();
export function bodyValidator(schema: any): RequestHandler {
    return (req, res, next) => {
        const isValid = ajv.validate(schema, req.body);
        if (!isValid) {
            next(new ValidateError(ajv.errors));
        } else {
            next();
        }
    };
}
