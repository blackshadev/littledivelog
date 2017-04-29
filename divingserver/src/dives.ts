import { QueryResult } from "@types/pg";
import * as express from "express";
import { isPrimitive } from "util";
import { database } from "./pg";
import { SqlBatch } from "./sql";

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
    body.tanks = body.tanks.map((tank) => {
        // tslint:disable-next-line:max-line-length
        return `(${tank.volume},${tank.oxygen},(${tank.pressure.begin}, ${tank.pressure.end}, '${tank.pressure.type}'))`;
    });

    const batch = new SqlBatch();
    let sql = "update dives set updated = (current_timestamp at time zone 'UTC')";
    const flds = ["date", "divetime", "max_depth", "tanks"];
    const params = [];
    for (const fld of flds) {
        sql += `, ${fld} = $${params.push(body[fld])}`;
    }
    sql += ` where dive_id = $${params.push(req.params.id)} and user_id = $${params.push(userid)}`;

    batch.add(sql, params, (ds) => {
        if (ds.rowCount !== 1) {
            throw new Error("Unable to update given dive");
        }
    });

    batch.add("delete from dive_tags where dive_id=$1", [req.params.id]);
    batch.add("delete from dive_buddies where dive_id=$1", [req.params.id]);

    body.tags.forEach((tag) => {
        if (tag.tag_id !== undefined) {
            return;
        }

        batch.add(
            "insert into tags (text, color, user_id) values ($1, $2, $3) returning *",
            [tag.text, tag.color, userid],
            (ds) => {
                tag.tag_id = ds.rows[0].tag_id;
            },
        );
    });
    body.buddies.forEach((buddy) => {
        if (buddy.buddy_id !== undefined) {
            return;
        }

        batch.add(
            "insert into buddies (text, color, user_id) values ($1, $2, $3) returning *",
            [buddy.text, buddy.color, userid],
            (ds) => { buddy.buddy_id = ds.rows[0].buddy_id; },
        );
    });

    body.tags.forEach((tag) => {
        batch.add(
            "insert into dive_tags (dive_id, tag_id) values ($1, $2)",
            [req.params.id, () => tag.tag_id],
        );
    });
    body.buddies.forEach((buddy) => {
        batch.add(
            "insert into dive_buddies (dive_id, buddy_id) values ($1, $2)",
            [req.params.id, () => buddy.buddy_id],
        );
    });

    try {
        await batch.execute();

        res.json({
            updated: true,
        });
    } catch (err) {
        res.statusCode = 500;
        res.json({
            error: "UNEXPECTED-SQL-ERROR",
            messge: err.message,
            stacktrace: err.stack,
        });
    }

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
