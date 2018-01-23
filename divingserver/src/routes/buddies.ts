import * as express from "express";
import { Router } from "../express-promise-router";
import { QueryResult } from "pg";
import { database } from "../pg";
import { SqlBatch } from "../sql";

export const router = Router();

router.get("/", async (req, res) => {
    const buds: QueryResult = await database.call(
        `select bud.*
           from buddies bud
          where bud.user_id = $1
       order by bud.buddy_id asc
        `,
        [req.user.user_id],
    );

    res.json(buds.rows);
});

router.get("/full", async (req, res) => {
    const stats = await database.call(
        `
        select
              bud.buddy_id
            , bud.text
            , bud.color
            , bud.email
            , bud.buddy_user_id
            , (select count(*) from dive_buddies d_b where bud.buddy_id = d_b.buddy_id) as dive_count
            , (
                select max(d.date)
                  from dive_buddies d_b
                  join dives d on d.dive_id = d_b.dive_id
                 where bud.buddy_id = d_b.buddy_id
             ) as last_dive
          from buddies bud
          where bud.user_id = $1
        `,
        [req.user.user_id],
    );

    res.json(stats.rows);
});

router.post("/", async (req, res) => {
    const body = req.body;
    const buds: QueryResult = await database.call(
        `
            insert
                into buddies (user_id, text, color, email)
                      values ($1, $2, $3, $4)
                   returning *
        `,
        [req.user.user_id, body.text, body.color, body.email],
    );

    res.json(buds.rows[0]);
});

router.delete("/:id", async (req, res) => {
    const batch = new SqlBatch();
    batch.add(
        `
        delete
          from dive_buddies
         where buddy_id = $2
           and dive_id in (
               select dive_id
                 from dives d
                where user_id = $1
           )
    `,
        [req.user.user_id, req.params.id],
    );

    batch.add(
        `
        delete
          from buddies
         where buddy_id = $2
           and user_id = $1
    `,
        [req.user.user_id, req.params.id],
    );

    const c = await batch.execute();
    res.json(c > 0);
});

router.put("/:id", async (req, res) => {
    const body = req.body;
    const buds: QueryResult = await database.call(
        `
            update buddies
               set text  = coalesce($1, text)
                 , color = coalesce($2, color)
                 , email = coalesce($3, email)
             where buddy_id = $4
               returning *
        `,
        [body.text, body.color, body.email, req.params.id],
    );

    res.json(buds.rows[0]);
});
