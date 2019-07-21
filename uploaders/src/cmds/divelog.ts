import { CommandBuilder } from "yargs";
import * as odbc from "odbc";
import { existsSync } from "fs";
import { resolve } from "path";
import * as moment from "moment";

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

export const handler = async (argv: { file: string }) => {
    console.log("HERE");
    const abs = resolve(argv.file);
    const exists = existsSync(argv.file);
    if (!exists) {
        throw new Error("Unable to find file");
    }

    const connStr = `Driver={Microsoft Access Driver (*.mdb, *.accdb)};Dbq=${abs}; `;

    console.log("opening", connStr);

    let db = await odbc.connect(connStr);

    await readLogBook(db);

    await new Promise<void>((res, rej) => {
        db.close((err) => (err ? rej(err) : res()));
    });
};

// async function open(connstr: string): Promise<odbc.Connection> {
//     return new Promise<odbc.Connection>((res, rej) => {
//         odbc.connect(connstr, (err, db) => (err ? rej(err) : res(db)));
//     });
// }

async function readLogBook(db: odbc.Connection): Promise<void> {
    // console.log("readLogBook");
    // const cols = await db.columns(null, null, TABLES.Logbook, null);
    // console.log(cols.map((c) => c.COLUMN_NAME));

    const rows = await db.query(
        `select PresS, PresE, Divedate, Entrytime, Country, City, Place, Buddy, Depth, Divetime, Tanksize, O2 from ${
            TABLES.Logbook
        }`
    );

    rows.forEach((r) => {
        const d = r.Divedate.substr(0, 10) + " " + r.Entrytime.substr(11);
        r.Date = new Date(d);
    });

    console.log(rows);
}
