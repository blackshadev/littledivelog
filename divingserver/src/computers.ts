import { QueryResult } from "@types/pg";
import * as express from "express";
import { isPrimitive } from "util";
import { database } from "./pg";
import { SqlBatch } from "./sql";

export const router  = express.Router();

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
