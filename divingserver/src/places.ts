import * as express from "express";
import { QueryResult } from "pg";
import { database } from "./pg";

export const router  = express.Router();

router.get("/:country_code", async (req, res) => {

    const places: QueryResult = await database.call(
        `select plc.*
           from places plc
           where plc.country_code = $1
           order by (
               select count(*)
                 from dives d
                where d.user_id = $2
                  and d.place_id = plc.place_id
           )
           limit 50
        `,
        [req.params.country_code, req.user.user_id],
    );

    res.json(
        places.rows,
    );
});

router.get("/", async (req, res) => {

    const places: QueryResult = await database.call(
        `select plc.*
           from places plc
          where 1=1
            and exists (
                select 1
                  from dives d
                where d.user_id = $1
                  and d.place_id = plc.place_id
            )
        `,
        [req.user.user_id],
    );

    res.json(
        places.rows,
    );
});
