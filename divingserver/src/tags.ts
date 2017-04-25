import { QueryResult } from "@types/pg";
import * as express from "express";
import { database } from "./pg";

export const router  = express.Router();

router.get("/", async (req, res) => {

    const buds: QueryResult = await database.call(
        `select tag.*
           from tags tag
           join sessions ses on ses.user_id = tag.user_id
          where ses.session_id = $1
        `,
        [res.locals.session],
    );

    res.json(
        buds.rows,
    );
});
