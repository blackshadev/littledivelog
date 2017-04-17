import { DbAdapter } from './pg';
import { QueryResult } from "@types/pg";
import * as express from 'express';

export const router  = express.Router();

router.get("/", async (req, res) => {
    const dives: QueryResult = await req.app.locals.db.call(
        "select dive_id, divetime, date, tags, place from get_dives($1)",
        [res.locals.session],
    );

    res.json(
        dives.rows,
    );
});

router.get("/:id", async (req, res) => {

    const dives: QueryResult = await req.app.locals.db.call(
        "select * from get_dives($1) where dive_id=$2",
        [res.locals.session, req.params.id],
    );

    res.json(
        dives.rows[0],
    );
});

const fields = {
    dive: {
        dive_id: "dive_id",
        divetime: "divetime",
    }
};

router.put("/:id", async (req, res) => {
    const db = req.app.locals.db as DbAdapter;
    const useridDs = await db.call(`select user_id from sessions where session_id=$1`, [res.locals.session]);
    const userid = useridDs.rows[0].user_id;

    const body = req.body;
    let sql = "update dives set updated = (current_timestamp at time zone 'UTC')";
    const params = [];
    for (const k in body) {
        if (body.hasOwnProperty(k)) {
            sql += `, ${k}=$${params.push(body[k])}`;
        }
    }
    sql += ` where dive_id=$${params.push(req.params.id)} and user_id=$${params.push(userid)}`;
    const result: QueryResult = await req.app.locals.db.call(
        sql,
        params,
    );
    if (result.rowCount === 0) {
        throw new Error("No such dive found");
    }
    res.json({
        updated: true,
    });
});

router.get("/:id/samples", async (req, res) => {

    const samples: QueryResult = await req.app.locals.db.call(
        "select samples from dives d join sessions s on s.user_id = d.user_id where s.session_id = $1 and dive_id=$2",
        [res.locals.session, req.params.id],
    );

    res.json(
        samples.rows.length ? (samples.rows[0].samples || []) : [],
    );
});
