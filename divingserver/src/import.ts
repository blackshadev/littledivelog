import { QueryResult } from "@types/pg";
import * as express from "express";
import { database } from "./pg";

export const router  = express.Router();

interface IComputerSample {
    Time: number;
    Depth: number;
    Temperature: number;
}

interface IComputerDive {
    Fingerprint: string;
    Date: string;
    DiveTime: string;
    MaxDepth: number;
    MaxTemperature: number;
    MinTemperature: number;
    SurfaceTemperature: number;
    Samples: IComputerSample[];
}

interface IComputerImport {
    Computer: {
        Name: string;
        Vendor: string;
        Model: number;
        Type: number;
        Serial: number;
    };
    Dives: IComputerDive[];
}

router.post("/", async (req, res) => {
    const userid = req.user.user_id;

    const d = req.body as IComputerImport;
    const qs = await database.bulkInsert({
        data: d.Dives,
        mapping: {
            date: { field: "Date" },
            divetime: { field: "DiveTime", sql: "EXTRACT(EPOCH FROM {value}::interval)" },
            max_depth: { field: "MaxDepth" },
            samples: { field: "Samples", transform: (v) => JSON.stringify(v) },
            user_id: { field: "", transform: () => userid },
        },
        table: "dives",
    });

    res.json(
        {
            inserted: qs.rowCount,
        },
    );
});
