import request = require("request");
const URL = "http://localhost:3000/";
const authfile = ".divelog";
import { access, constants, readFile, writeFile } from "fs";
import { IncomingMessage } from "http";
export async function signin(
    email?: string,
    password?: string,
): Promise<{ jwt: string }> {
    const hasAuthFile = await new Promise((res, rej) => {
        access(authfile, constants.F_OK, (err) => {
            res(!err);
        });
    });

    if (hasAuthFile) {
        const cachedCred = await new Promise<
            undefined | { jwt: string; email: string }
        >((res, rej) => {
            readFile(authfile, { encoding: "utf8" }, (err, d) => {
                if (err) {
                    res(undefined);
                }

                try {
                    res(JSON.parse(d));
                } catch (err) {
                    res(undefined);
                }
            });
        });
        if (cachedCred) {
            return { jwt: cachedCred.jwt };
        }
    }

    const cred = await new Promise<{ jwt: string }>((res, rej) => {
        request.post(
            URL + "auth/refresh-token",
            {
                json: { email, password },
            },
            (err, resp, body) => {
                if (err) {
                    rej(err);
                } else if (resp.statusCode !== 200) {
                    rej(new Error(body.error));
                } else {
                    res({ jwt: body.jwt });
                }
            },
        );
    });

    await new Promise<void>((res, rej) => {
        writeFile(authfile, JSON.stringify({ jwt: cred.jwt, email }), (err) => {
            res();
        });
    });

    return { jwt: cred.jwt };
}
export async function getAccessToken(jwt: string): Promise<{ token: string }> {
    return new Promise<{ token: string }>((res, rej) => {
        request.get(
            URL + "auth/access-token",
            {
                auth: {
                    bearer: jwt,
                },
                json: true,
            },
            (err, resp, body) => {
                if (err) {
                    rej(err);
                } else if (resp.statusCode !== 200) {
                    rej(new Error(body.error));
                } else {
                    res({ token: body.jwt });
                }
            },
        );
    });
}
export async function dlRequest(oPar: {
    path: string;
    token: string;
    method: "POST" | "GET" | "PUT" | "DELETE" | "PATCH";
    json: any;
}) {
    return new Promise<{ response: IncomingMessage; body: any }>((res, rej) => {
        request(
            URL + oPar.path,
            {
                method: oPar.method,
                json: oPar.json,
                auth: {
                    bearer: oPar.token,
                },
            },
            (err, resp, body) => {
                if (err) {
                    rej(err);
                } else {
                    res({ response: resp, body });
                }
            },
        );
    });
}
