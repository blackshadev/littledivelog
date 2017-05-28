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

interface IRemoteSession {
    session_id: string;
}

router.post("/", async (req, res) => {
    let user: IUserRow;
    const b = req.body;

    try {
        user = await login(b.email, b.password);
    } catch (err) {
        res.status(err.message === "Invalid credentials" ? 401 : 500);
        res.json({ error: err.message });
        return;
    }

    const ds = await database.call(
        `insert into remote_sessions (
              user_id
            , ip
        ) values (
              $1
            , $2
        )
        returning *`,
        [
            user.user_id,
            req.connection.remoteAddress,
        ],
    );

    const sess = ds.rows[0] as IRemoteSession;
    try {
        const tok = createToken({ session_id: sess.session_id });
        res.json({ data: tok });
    } catch (err) {
        res.status(500);
        res.json({
            error: err.message,
        });
    }

});

router.get("/", async (req, res) => {

    const session: QueryResult = await database.call(
        `select
              sess.session_id
            , sess.last_used
            , user.user_id
            , user.email
            , user.name
            , (
                select count(*)
                  from dives d
                 where d.user_id = sess.user_id
            ) as total_dive_count
            , 0::int as session_dive_count
           from remote_sessions sess
           join users user on sess.user_id = user.user_id
           where sess.session_id = $1
        `,
        [req.user.session_id],
    );

    if (session.rows.length === 0) {
        res.status(401);
        res.json({ error: "Invalid authentication token" });
    }

    res.json(
        session.rows[0],
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
