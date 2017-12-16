import * as express from "express";
import { QueryResult } from "pg";
import { database } from "./pg";
import { SqlBatch } from "./sql";

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

router.delete("/:id", async (req, res) => {
    const batch = new SqlBatch();
    batch.add(`
        delete
          from dive_tags
         where tag_id = $2
           and dive_id in (
               select dive_id
                 from dives d
                where user_id = $1
           )
    `, [
        req.user.user_id,
        req.params.id,
    ]);

    batch.add(`
        delete tags
         where tag_id = $2
           and user_id = $1
    `, [
        req.user.user_id,
        req.params.id,
    ]);

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
        [
            req.user.user_id,
            body.text,
            body.color,
        ],
    );

    res.json(
        tags.rows,
    );
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
        [
            body.text,
            body.color,
            req.params.id,
        ],
    );

    res.json(
        tags.rows,
    );
});
