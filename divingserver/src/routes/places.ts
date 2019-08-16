import * as express from "express";
import { QueryResult } from "pg";
import { Router } from "../express-promise-router";
import { IAuthenticatedRequest } from "../express.interface";
import { database } from "../pg";
import { SqlBatch } from "../sql";

export const router = Router();

router.get("/:country_code", async (req: IAuthenticatedRequest, res) => {
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

    res.json(places.rows);
});

router.get("/", async (req: IAuthenticatedRequest, res) => {
    const places: QueryResult = await database.call(
        `select plc.*
           from places plc
          order by (
              select count(*)
                from dives d
               where d.place_id = plc.place_id
                 and d.user_id = $1
            ) desc
        `,
        [req.user.user_id],
    );

    res.json(places.rows);
});

router.get("/full", async (req: IAuthenticatedRequest, res) => {
    const stats = await database.call(
        `
            select p.*
            , (
                select count(*)
                from dives d
                where d.place_id = p.place_id
            ) as dive_count
            , (
                select max(d.date)
                from dives d
                where d.place_id = p.place_id
            )
        from (
            select distinct d.place_id
            from dives d
            where d.user_id = $1
        ) x
        join places p on x.place_id = p.place_id
        `,
        [req.user.user_id],
    );

    res.json(stats.rows);
});

router.delete("/:id", async (req: IAuthenticatedRequest, res) => {
    const batch = new SqlBatch();
    batch.add(
        `update dives
            set place_id = null
            where place_id = $2
              and user_id = $1
        `,
        [req.user.user_id, req.params.id],
    );

    batch.add(
        `
        delete
          from places
         where place_id = $1
           and (
                select count(*)
                  from dive_places dp
                 where dp.place_id = $1
            ) = 0
        `,
        [req.params.id],
    );

    const c = await batch.execute();
    res.json(c > 0);
});
