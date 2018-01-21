import * as bluebird from "bluebird";
import { Request } from "express";
import * as jwt from "jsonwebtoken";
import { config } from "./config";
import { HttpError } from "./errors";

export async function createToken(
    dat: any,
    opt: {
        subject?: string;
        expiresIn?: string;
    } = {},
): Promise<string> {
    return new Promise<string>((resolve, reject) => {
        jwt.sign(
            dat,
            config.jwt.secret,
            {
                algorithm: "HS512",
                issuer: config.jwt.issuer,
                subject: opt.subject,
                expiresIn: opt.expiresIn,
            },
            (err, result) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(result);
                }
            },
        );
    });
}

export async function verifyAsync(
    token: string,
    secretOrPublicKey: string | Buffer,
    options?: jwt.VerifyOptions,
): Promise<any> {
    return new Promise((resolve, reject) => {
        jwt.verify(token, secretOrPublicKey, options, (err, dat) => {
            if (err) {
                reject(new HttpError(401, "Invalid JWT; " + err.message));
            } else {
                resolve(dat);
            }
        });
    });
}

export function getToken(req: Request): string {
    const auth = req.headers.authorization as string;
    if (!auth) {
        throw new HttpError(
            400,
            "Bad request; Expected to have an authorization header",
        );
    }

    const authParts = auth.split(" ");
    if (authParts.length !== 2) {
        throw new HttpError(
            400,
            "Bad request; Expected authorization header to have no more then 2 values seperated by a space, tye and token.",
        );
    }
    const [type, token] = authParts;

    if (type.toLowerCase() !== "bearer") {
        throw new HttpError(
            400,
            "Bad request; Expected authorization header to be of type bearer",
        );
    }

    return token;
}
