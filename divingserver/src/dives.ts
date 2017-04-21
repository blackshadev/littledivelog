import { QueryResult } from "@types/pg";
import * as express from "express";
import { isPrimitive } from "util";
import { DbAdapter } from "./pg";

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

router.put("/:id", async (req, res) => {
    const db = req.app.locals.db as DbAdapter;
    const useridDs = await db.call(`select user_id from sessions where session_id=$1`, [res.locals.session]);
    const userid = useridDs.rows[0].user_id;

    const body = JSON.parse('"{date":"2017-04-03T05:12:04.000Z","divetime":3780,"max_depth":12.4,"place":{"name":"De beldert","country_code":"NL"},"tanks":[{"oxygen":"211","volume":"10","pressure":{"start":"200","end":"50","type":"bar"}}],"tags":[{"color":"#09021f","text":"Night"},{"color":"#87f210","text":"Deco"}],"buddies":[{"color":"#0110ff","text":"Iris"}]}"'); //req.body;

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
