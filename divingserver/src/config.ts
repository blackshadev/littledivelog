import * as fs from "fs";

interface IConfig {
    http: {
        port: number|string;
    };
    database: {
        host: string;
        username: string;
        port?: string;
        password?: string;
    };
}

export let config: IConfig = {
    http: {
        port: 3000,
    },
    database: {
        host: "please.provide.a.valid.config.json",
        username: "uname",
    },
};

export async function readConfig(path: string): Promise<IConfig> {
    return new Promise<IConfig>((resolve, reject) => {
        fs.readFile(path, { encoding: "utf8" }, (err, data) => {
            if (err) {
                return reject(err);
            }
            try {
                config = JSON.parse(data);
                return resolve(config);
            } catch (err) {
                return reject(err);
            }

        });

    });
}
