import { QueryResult } from "@types/pg";
import * as express from "express";
import { isPrimitive } from "util";
import { database } from "./pg";

export const router  = express.Router();

router.get("/", async (req, res) => {
    const dives: QueryResult = await database.call(
        "select dive_id, divetime, date, tags, place from get_dives($1)",
        [res.locals.session],
    );

    res.json(
        dives.rows,
    );
});

router.get("/:id", async (req, res) => {

    const dives: QueryResult = await database.call(
        "select * from get_dives($1) where dive_id=$2",
        [res.locals.session, req.params.id],
    );

    res.json(
        dives.rows[0],
    );
});

router.put("/:id", async (req, res) => {

    const useridDs = await database.call(`select user_id from sessions where session_id=$1`, [res.locals.session]);
    const userid = useridDs.rows[0].user_id;

    const body = req.body;

    let sql = "update dives set updated = (current_timestamp at time zone 'UTC')";
    const flds = ["date", "divetime", "max_depth"];
    const params = [];
    for (const fld of flds) {
        sql += `, ${fld} = $${params.push(body[fld])}`;
    }
    sql += ` where dive_id = $${params.push(req.params.id)} and user_id = $${params.push(userid)}`;

    console.log(sql, params);

    const result: QueryResult = await database.call(
        sql,
        params,
    );
    console.log(result);
    if (result.rowCount === 0) {
        throw new Error("No such dive found");
    }
    res.json({
        updated: true,
    });
});

router.get("/:id/samples", async (req, res) => {

    const samples: QueryResult = await database.call(
        "select samples from dives d join sessions s on s.user_id = d.user_id where s.session_id = $1 and dive_id=$2",
        [res.locals.session, req.params.id],
    );

    res.json(
        samples.rows.length ? (samples.rows[0].samples || []) : [],
    );
});
