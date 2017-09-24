import * as express from "express";
import { QueryResult } from "pg";
import { isPrimitive } from "util";
import { database } from "./pg";
import { SqlBatch } from "./sql";
import { bodyValidator } from "./validator";

export const router  = express.Router();

interface IImportSample {
    Time: number;
    Depth: number;
    Temperature: number;
}

enum VolumeType {
    None,
    Metric,
    Imperial,
}

interface IGasmix {
    helium: number;
    oxygen: number;
    nitrogen: number;
}

interface ITank {
    type: VolumeType;
    volume: number;
    workpressure: number;
    beginpressure: number;
    endpressure: number;
}

interface IImportDive {
    Fingerprint: string;
    Date: Date;
    DiveTime: string;
    MaxDepth: number;
    MaxTemperature?: number;
    MinTemperature?: number;
    SurfaceTemperature?: number;
    Tank?: ITank;
    Gasmix?: IGasmix;
    Samples: IImportSample[];
}

interface IImportComputer {
    Serial: number;
    Model: number;
    Vendor: string;
    Name: string;
    Type: number;
}

interface IImportData {
    Dives: IImportDive[];
    Computer: IImportComputer;
}

interface IImportOptions {}

interface IImportRequestBody {
    data: IImportData;
    options: IImportOptions;
}

router.get("/", async (req, res) => {

    const computers: QueryResult = await database.call(
        `select
            comp.*,
            (
                select count(*)
                  from dives
                 where computer_id = comp.computer_id
            ) as dive_count
           from computers comp
           where comp.user_id = $1
           order by last_read
        `,
        [req.user.user_id],
    );

    res.json(
        computers.rows,
    );
});

const computerPostSchema = {
    type: "object",
    properties: {
        serial: { type: "number" },
        vendor: { type: "string" },
        model: { type: "number" },
        type: { type: "number" },
        name: { type: "string" },
    },
    required: ["serial"],
};

router.post("/", bodyValidator(computerPostSchema), async (req, res) => {

    const computer = await database.call(
        `insert into computers (user_id, serial, vendor, model, type, name)
                        values ($1     , $2    , $3    , $4   , $5  , $6  )
                   on conflict (user_id, serial)
                     do update set
                              vendor = isnull($3, EXCLUDED.vendor)
                            , model  = isnull($4, EXCLUDED.model)
                            , type   = isnull($5, EXCLUDED.type)
                            , name   = isnull($6, EXCLUDED.name)
            returning *
        `,
        [
            req.user.user_id,
            req.body.serial,
            req.body.vendor,
            req.body.model,
            req.body.type,
            req.body.name,
        ],
    );

    res.json(computer.rows[0]);
});
