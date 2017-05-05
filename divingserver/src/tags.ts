import { QueryResult } from "@types/pg";
import * as express from "express";
import { database } from "./pg";

export const router  = express.Router();

router.get("/", async (req, res) => {

    const buds: QueryResult = await database.call(
        `select tag.*
           from tags tag
          where tag.user_id = $1
        `,
        [req.user.user_id],
    );

    res.json(
        buds.rows,
    );
});
