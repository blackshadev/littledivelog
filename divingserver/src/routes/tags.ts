import * as express from "express";
import { Router } from "../express-promise-router";
import { QueryResult } from "pg";
import { database } from "../pg";
import { SqlBatch } from "../sql";

export const router = Router();

router.get("/", async (req, res) => {
    const buds: QueryResult = await database.call(
        `select tag.*
           from tags tag
          where tag.user_id = $1
       order by tag.tag_id asc
        `,
        [req.user.user_id],
    );

    res.json(buds.rows);
});

router.get("/full", async (req, res) => {
    const stats = await database.call(
        `
        select
              t.tag_id
            , t.text
            , t.color
            , (select count(*) from dive_tags d_t where t.tag_id = d_t.tag_id) as dive_count
            , (
                select max(d.date)
                    from dive_tags d_t
                    join dives d on d.dive_id = d_t.dive_id
                where t.tag_id = d_t.tag_id
            ) as last_dive
            from tags t
            where t.user_id = $1
        `,
        [req.user.user_id],
    );

    res.json(stats.rows);
});

router.delete("/:id", async (req, res) => {
    const batch = new SqlBatch();
    batch.add(
        `
        delete
          from dive_tags
         where tag_id = $2
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
          from tags
         where tag_id = $2
           and user_id = $1
    `,
        [req.user.user_id, req.params.id],
    );

    const c = await batch.execute();
    res.json(c > 0);
});

router.post("/", async (req, res) => {
    const body = req.body;
    const tags: QueryResult = await database.call(
        `
            insert
                into tags (user_id, text, color)
                        values ($1, $2, $3)
                    returning *
        `,
        [req.user.user_id, body.text, body.color],
    );

    res.json(tags.rows[0]);
});

router.put("/:id", async (req, res) => {
    const body = req.body;
    const tags: QueryResult = await database.call(
        `
            update tags
                set text  = coalesce($1, text)
                    , color = coalesce($2, color)
                where tag_id = $3
                returning *
        `,
        [body.text, body.color, req.params.id],
    );

    res.json(tags.rows[0]);
});
