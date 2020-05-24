import { existsSync } from "fs";
import * as odbc from "odbc";
import { resolve } from "path";
import { CommandBuilder } from "yargs";
import { getAccessToken, signin, dlRequest } from "../divelog";

export const command = "divinglog [file]";
export const desc = "Upload a divinglog mdb file";
export const builder: CommandBuilder = (yargs) => {
    return yargs
        .string("file")
        .alias("f", "file")
        .nargs("f", 1)
        .describe("f", "File to upload")
        .demandOption("f")
        .string("email")
        .describe("email", "Email adres to log into the divelog server")
        .demandOption("email")
        .string("password")
        .describe("password", "Password of the diving log")
        .demandOption("password")
        .string("country-map");
};

const TABLES = {
    Logbook: "Logbook",
};

interface ITank {
    volume: number;
    oxygen: number;
    pressure: {
        begin: number;
        end: number;
        type: "bar" | "psi";
    };
}

interface IBatchDive {
    max_depth: number;
    dive_time: number;
    date: string;
    tags: string[];
    place: {
        country_code?: string;
        country?: string;
        name: string;
    };
    buddies: string[];
    tanks: ITank[];
}

export const handler = async (argv: {
    file: string;
    email: string;
    password: string;
    countryMap: string;
}) => {
    try {
        const { jwt } = await signin(argv.email, argv.password);

        let countryMap: { [name: string]: string } = {};
        if (argv.countryMap) {
            countryMap = require(resolve(argv.countryMap));
        }

        const abs: string = resolve(argv.file);
        const exists: boolean = existsSync(argv.file);
        if (!exists) {
            throw new Error("Unable to find file");
        }

        const connStr: string = `Driver={Microsoft Access Driver (*.mdb, *.accdb)};Dbq=${abs}; `;

        console.log("opening", connStr);

        const db = await odbc.connect(connStr);

        const srcRows = await readLogBook(db);

        await db.close();

        const { token } = await getAccessToken(jwt);

        const newRows = srcRows.map((r) => {
            const countryCode = countryMap[r.Country.toLocaleLowerCase()];

            const d = r.Divedate.substr(0, 10) + " " + r.Entrytime.substr(11);

            return {
                date: d,
                buddies: [r.Buddy],
                dive_time: r.Divetime * 60, // Divinglog registers divetime in minutes
                place: {
                    country: r.Country,
                    country_code: countryCode,
                    name: r.Place,
                },
                max_depth: r.Depth,
                tags: [],
                tanks: [
                    {
                        oxygen: r.O2,
                        volume: r.Tanksize,
                        pressure: {
                            begin: r.PresS,
                            end: r.PresE,
                            type: "bar",
                        },
                    },
                ],
            } as IBatchDive;
        });

        const { response, body } = await dlRequest({
            path: "dive/batch",
            json: newRows,
            method: "POST",
            token: token,
        });

        if (response.statusCode !== 200) {
            throw new Error(body.error);
        }
        console.log("Imported " + body.dives.length + " dives");
    } catch (err) {
        console.error("Something went wrong\n" + err.toString());
    }
};

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
    return ((await db.query(
        `select PresS, PresE, Divedate, Entrytime, Country, City, Place, Buddy, Depth, Divetime, Tanksize, O2 from ${TABLES.Logbook}`,
    )) as any) as ILogRow[];
}
