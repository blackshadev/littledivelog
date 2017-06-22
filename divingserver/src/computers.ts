import { QueryResult } from "@types/pg";
import * as express from "express";
import { isPrimitive } from "util";
import { database } from "./pg";
import { SqlBatch } from "./sql";

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

router.post("/", async (req, res) => {

    const computer = await database.call(
        `insert into computers (user_id) values ($1) returning *`,
        [
            req.user.user_id,
        ],
    );

    res.json(computer.rows[0]);

});

router.get("/import", async (req, res) => {

    const computerId = req.user.computer_id;
    if (computerId === undefined) {
        res.status(401).json({ error: "Invalid token for import. Please generate a valid token in the dive app" });
        return;
    }

    const computers: QueryResult = await database.call(
        `select
            comp.*,
            (
                select count(*)
                  from dives
                 where computer_id = comp.computer_id
            ) as dive_count
           from computers comp
           where comp.computer_id = $1
        `,
        [req.user.computer_id],
    );

    res.json(
        computers.rows[0],
    );
});

router.put("/:id", async (req, res) => {

    const computerId = req.params.id;

    let userId: number;
    const body = req.body as IImportRequestBody;
    const sql = new SqlBatch();
    sql.add(
        `update computers set
              serial = $3
            , vendor = $4
            , model = $5
            , type = $6
            , name = $7
          where computer_id = $1 and user_id = $2
          returning *
        `,
        [
            computerId,
            req.user.user_id,
            body.data.Computer.Serial,
            body.data.Computer.Vendor,
            body.data.Computer.Model,
            body.data.Computer.Type,
            body.data.Computer.Name,
        ],
        (r) => {
            userId = r.rows[0].user_id;
        },
    );

    const flds = [
        "user_id",
        "computer_id",
        "date",
        "divetime",
        "max_depth",
        "samples",
        "tanks",
        "fingerprint",
    ];

    const diveSql = `
        insert into dives (
            ${flds.join(", ")}
        ) values (
            ${flds.map((el, iX) => `$${iX + 1}`).join(", ")}
        )
        on conflict (fingerprint)
            do nothing
    `;
    for (const dive of body.data.Dives) {
        const tank = dive.Tank;
        const tankType = tank.type === 0 ? "bar" : tank.type === 1 ? "bar" : "psi";

        // tslint:disable-next-line:max-line-length
        const tanks = `{${dive.Tank.volume},${dive.Gasmix.oxygen},\\"(${dive.Tank.beginpressure},${dive.Tank.endpressure},${tank.type})\\")`;
        sql.add(
            diveSql,
            [
                () => userId,
                computerId,
                dive.Date,
                dive.DiveTime,
                dive.MaxDepth,
                JSON.stringify(dive.Samples),
                tanks,
                dive.Fingerprint,
            ],
        );

        sql.add(
            `update computers
                set
                  last_read = $1
                , last_fingerprint = $2
                where computer_id = $3
                  and last_read < $1
            `,
            [
                dive.Date,
                dive.Fingerprint,
                computerId,
            ],
        );
    }

    await sql.execute();

});
