import { QueryResult } from "@types/pg";
import * as express from "express";

export const router  = express.Router();

router.get("/", async (req, res) => {
    const dives: QueryResult = await req.app.locals.dbcall(
        "select dive_id, date, tags, place from get_dives($1)",
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
        dives.rows,
    );
});

router.get("/:id/samples", async (req, res) => {

    const samples: QueryResult = await req.app.locals.db.call(
        "select samples from dives d join sessions s on s.user_id = d.user_id where s.session_id = $1 and dive_id=$2",
        [res.locals.session, req.params.id],
    );

    res.json(
        samples.rows,
    );
});
