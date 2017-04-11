import { QueryResult } from "@types/pg";
import * as express from "express";

export const router  = express.Router();

router.get("/", async (req, res) => {
    let dives: QueryResult = await req.app.locals.dbcall(
        "select * from dives",
        [],
    );

    res.json(
        dives.rows,
    );
});

router.get("/:id", async (req, res) => {
    console.log("locals", res.locals);

    let dives: QueryResult = await req.app.locals.dbcall(
        "select * from dives where dive_id=$1",
        [req.params.id],
    );

    res.json(
        dives.rows,
    );
});

