import * as Ajv from "ajv";
import * as fs from "fs";
import * as dotenv from "dotenv";

interface IConfig {
    cors?: boolean;
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
        cors: {
            type: "boolean",
        },
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

function asInt(val: string | undefined): number | undefined {
    return val !== undefined ? parseInt(val, 10) : undefined;
}
function asArray(val: string): string[] | undefined {
    return val !== undefined ? val.split(",") : undefined;
}
function asBoolean(val: string): boolean | undefined {
    return val !== undefined ? /^1|true$/i.test(val) : undefined;
}

export async function envVariableConfig(): Promise<IConfig> {
    dotenv.config();

    const obj: IConfig = {
        database: {
            host: process.env["DB-HOST"],
            database: process.env["DB-DATABASE"],
            password: process.env["DB-PASSWORD"],
            username: process.env["DB-USERNAME"],
            port: asInt(process.env["DB-PORT"]),
        },
        http: {
            port: asInt(process.env["HTTP-PORT"]) || 80,
            proxy: asArray(process.env["HTTP-PROXY"]),
        },
        jwt: {
            issuer: process.env["JWT-ISSUER"],
            secret: process.env["JWT-SECRET"],
        },
        cors: asBoolean(process.env["HTTP-CORS"]),
    };

    if (!validator(obj)) {
        throw new Error(ajv.errorsText(validator.errors));
    }

    config = obj;

    return obj;
}
