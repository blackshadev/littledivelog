
import * as jwt from "jsonwebtoken";
import { config } from "./config";

export async function createToken(dat: any): Promise<string> {
    return new Promise<string> (
        (resolve, reject) => {
            jwt.sign(
                dat,
                config.jwt.secret,
                {
                    algorithm: "HS512",
                    issuer: config.jwt.issuer,
                },
                (err, result) => {
                    if (err) {
                        reject(err);
                    } else {
                        resolve(result);
                    }
                },
            );
        },
    );
}
