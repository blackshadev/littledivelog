import * as bluebird from "Bluebird";
import * as fs from "fs";
import * as path from "path";
import * as pg from "pg";

const cnf = {
    host: "littledev.nl",
    passwd: "divelog",
    user: "divelog",
};

const readDir = bluebird.promisify(fs.readdir);
const readFile = bluebird.promisify(fs.readFile);
const stat = bluebird.promisify(fs.stat);


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

    await conn.connect();

    await conn.query("drop database if exists divelog");
    await conn.query("create database divelog  with owner= 'divelog'");
}

async function listQueries(baseDir: string = "./db/"): Promise<string[]> {
    async function recReadDir(dirPath: string): Promise<string[]> {
        const entries = await readDir(dirPath);
        const all = [];
        for(const entry of entries) {
            const fPath = path.join(dirPath, entry);
            const fStat = await stat(fPath);
            if(fStat.isFile()) {
                all.push(fPath);
            } else if(fStat.isDirectory()) {
                all.push(... await recReadDir(fPath));
            }
        }

        return all;
    }


    return recReadDir(baseDir);
}

async function all() {
    const queries = await listQueries();
    console.log(queries);
}
