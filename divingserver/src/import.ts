import { QueryResult } from "@types/pg";
import * as express from "express";
import { IUserRow, login } from "./auth";
import { createToken } from "./jwt";
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

router.get("/", async (req, res) => {

    const session: QueryResult = await database.call(
        `select
              usr.user_id
            , usr.email
            , usr.name
            , total_dive_count = (
                select count(*)
                  from dives d
                 where d.user_id = ses.user_id
            )
           from users usr
           where usr.user_id = $1
        `,
        [req.user.session_id],
    );

    if (session.rows.length === 0) {
        res.status(401);
        res.json({ error: "Invalid authentication token" });
    }

    const computers: QueryResult = await database.call(
        `select
               comp.*
             , dive_count = (
                select count(*)
                  from dives d
                 where d.computer_id = comp.computer_id
             )
           from computers comp
           where comp.user_id = $1
        `,
        [session.rows[0].user_id],
    );

    res.json({
        computers: computers.rows,
        session: session.rows[0],
    });
});

router.post("/computer", async (req, res) => {

    const session: QueryResult = await database.call(
        `
        insert into computers (user_id, serial, vendor, model, type, name)
                        values($1     , $2    , $3    , $4   , $5  , $6  )
        returning *
        `,
        [req.user.user_id],
    );

});

// router.post("/", async (req, res) => {
//     const userid = req.user.user_id;

//     const d = req.body as IComputerImport;
//     const qs = await database.bulkInsert({
//         data: d.Dives,
//         mapping: {
//             date: { field: "Date" },
//             divetime: { field: "DiveTime", sql: "EXTRACT(EPOCH FROM {value}::interval)" },
//             max_depth: { field: "MaxDepth" },
//             samples: { field: "Samples", transform: (v) => JSON.stringify(v) },
//             user_id: { field: "", transform: () => userid },
//         },
//         table: "dives",
//     });

//     res.json(
//         {
//             inserted: qs.rowCount,
//         },
//     );
// });
