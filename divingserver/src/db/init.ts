import * as bluebird from "bluebird";
import * as fs from "fs";
import * as path from "path";
import * as pg from "pg";

const cnf = {
    database: "divelog",
    host: "littledev.nl",
    passwd: "tester",
    user: "divelog",
};

async function runQuery(conn: pg.Client, sql: string): Promise<void> {
    await conn.query(sql);
}

async function recreateDb() {
    const conn = new pg.Client({
        database: "postgres",
        host: cnf.host,
        password: cnf.passwd,
        user: cnf.user,
    });

    console.log("connect to master");
    await conn.connect();
    try {
        console.log("Recreating db");
        await conn.query(`drop database if exists ${cnf.database}`);
        await conn.query(
            `create database ${cnf.database} with owner ${cnf.user}`,
        );
    } finally {
        await conn.end();
    }
}

async function listQueries(
    baseDir: string = __dirname + "/../../db/",
): Promise<string[]> {
    async function recReadDir(dirPath: string): Promise<string[]> {
        const entries = await fs.promises.readdir(dirPath);
        entries.sort();
        const all = [];
        for (const entry of entries) {
            const fPath = path.join(dirPath, entry);
            const fStat = await fs.promises.stat(fPath);
            if (fStat.isFile() && /^\d+\_.*\.sql$/i.test(entry)) {
                all.push(fPath);
            } else if (fStat.isDirectory()) {
                all.push(...(await recReadDir(fPath)));
            }
        }

        return all;
    }

    return recReadDir(baseDir);
}

async function executeAll(filenames: string[]): Promise<void> {
    const client = new pg.Client({
        database: cnf.database,
        host: cnf.host,
        password: cnf.passwd,
        user: cnf.user,
    });
    console.log("connecting...");
    await client.connect();

    for (let iX = 0; iX < filenames.length; iX++) {
        const fpath = filenames[iX];
        const fname = path.basename(fpath);
        console.log(`Execute ${fname} (${iX}/${filenames.length})`);
        const sql = (await fs.promises.readFile(fpath)).toString("utf8");
        await client.query(sql);
    }

    await client.end();
}

async function all() {
    console.log("fetching  queries");
    const queries = await listQueries();

    await recreateDb();
    await executeAll(queries);
}

all();
