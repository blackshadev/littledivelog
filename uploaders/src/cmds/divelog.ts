import { existsSync } from "fs";
import * as moment from "moment";
import * as odbc from "odbc";
import { resolve } from "path";
import { CommandBuilder } from "yargs";
import { getAccessToken, signin } from "../divelog";
import request = require("request");

export const command = "divinglog [file]";
export const desc = "Upload a divinglog mdb file";
export const builder: CommandBuilder = (yargs) => {
    return yargs
        .string("file")
        .alias("f", "file")
        .nargs("f", 1)
        .describe("f", "File to upload")
        .demandOption("f");
};

const TABLES = {
    Logbook: "Logbook"
};

export const handler = async (argv: {
    file: string;
    email: string;
    password: string;
}) => {
    const { jwt } = await signin(argv.email, argv.password);

    const abs: string = resolve(argv.file);
    const exists: boolean = existsSync(argv.file);
    if (!exists) {
        throw new Error("Unable to find file");
    }

    const connStr: string = `Driver={Microsoft Access Driver (*.mdb, *.accdb)};Dbq=${abs}; `;

    console.log("opening", connStr);

    const db = await odbc.connect(connStr);

    await readLogBook(db);
    const { token } = await getAccessToken(jwt);

    await db.close();
};

// async function open(connstr: string): Promise<odbc.Connection> {
//     return new Promise<odbc.Connection>((res, rej) => {
//         odbc.connect(connstr, (err, db) => (err ? rej(err) : res(db)));
//     });
// }

interface ILogRow {
    PresS: number;
    PresE: number;
    Divedate: string;
    Entrytime: string;
    Country: string;
    City: string;
    Place: string;
    Buddy: string;
    Depth: number;
    Divetime: number;
    Tanksize: number;
    O2: number;
}

async function readLogBook(db: odbc.Connection): Promise<ILogRow[]> {
    // console.log("readLogBook");
    // const cols = await db.columns(null, null, TABLES.Logbook, null);
    // console.log(cols.map((c) => c.COLUMN_NAME));

    return ((await db.query(
        `select PresS, PresE, Divedate, Entrytime, Country, City, Place, Buddy, Depth, Divetime, Tanksize, O2 from ${
            TABLES.Logbook
        }`
    )) as any) as ILogRow[];

    const dlRows = rows.map((r) => {
        const d = r.Divedate.substr(0, 10) + "T" + r.Entrytime.substr(11);
        return {
            date: d,
            dive_time: r.Divetime,
            max_depth: r.Depth,
            tags: [],
            place: {
                country_name: r.Country,
                name: r.Place
            },
            buddies: [r.Buddy],
            tanks: [
                {
                    oxygen: r.O2,
                    volume: r.Tanksize,
                    pressure: {
                        begin: r.PresS,
                        end: r.PresE,
                        type: "bar"
                    }
                }
            ]
        };
    });
}
