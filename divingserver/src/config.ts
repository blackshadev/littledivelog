import * as Ajv from "ajv";
import * as fs from "fs";

interface IConfig {
    http: {
        port: number | string;
        proxy: boolean | string[] | string | undefined;
    };
    database: {
        host: string;
        database: string;
        username: string;
        port?: number;
        password?: string;
    };
    jwt: {
        secret: string;
        issuer: string;
    };
}

export let config: IConfig;

const ajv = Ajv();
const validator = ajv.compile({
    type: "object",
    properties: {
        jwt: {
            issuer: { type: "string" },
            secret: { type: "string" },
        },
        http: {
            type: "object",
            properties: {
                port: { type: "number" },
                proxy: {
                    anyOf: [
                        { type: "boolean" },
                        { type: "string" },
                        {
                            type: "array",
                            items: {
                                type: "string",
                            },
                        },
                    ],
                },
            },
            required: ["port"],
        },
        database: {
            type: "object",
            properties: {
                host: { type: "string" },
                username: { type: "string" },
                database: { type: "string" },
                port: { type: "string" },
                password: { type: "string" },
            },
            required: ["host", "username"],
        },
    },
    required: ["http", "database"],
});

export async function readConfig(path: string): Promise<IConfig> {
    return new Promise<IConfig>((resolve, reject) => {
        fs.readFile(path, { encoding: "utf8" }, (err, data) => {
            if (err) {
                return reject(err);
            }
            try {
                config = JSON.parse(data);
                if (!validator(config)) {
                    throw new Error(ajv.errorsText(validator.errors));
                }
                return resolve(config);
            } catch (err) {
                return reject(err);
            }
        });
    });
}
