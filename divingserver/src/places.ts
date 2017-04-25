import { QueryResult } from "@types/pg";
import * as express from "express";
import { database } from "./pg";

export const router  = express.Router();

router.get("/:country_code", async (req, res) => {

    const buds: QueryResult = await database.call(
        `select plc.*
           from places plc
           where country_code = $1
        `,
        [req.params.country_code],
    );

    res.json(
        buds.rows,
    );
});

router.get("/", async (req, res) => {

    const buds: QueryResult = await database.call(
        `select plc.*
           from places plc
        `,
        [req.params.country_code],
    );

    res.json(
        buds.rows,
    );
});
