import * as express from "express";
import { QueryResult } from "pg";
import { database } from "./pg";
import { SqlBatch } from "./sql";

export const router  = express.Router();

router.get("/", async (req, res) => {

    const buds: QueryResult = await database.call(
        `select bud.*
           from buddies bud
          where bud.user_id = $1
        `,
        [req.user.user_id],
    );

    res.json(
        buds.rows,
    );
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
        [
            req.user.user_id,
            body.text,
            body.color,
            body.email,
        ],
    );

    res.json(
        buds.rows,
    );
});

router.delete("/:id", async (req, res) => {
    const batch = new SqlBatch();
    batch.add(`
        delete
          from dive_buddies
         where buddy_id = $2
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
        delete
          from buddies
         where buddy_id = $2
           and user_id = $1
    `, [
        req.user.user_id,
        req.params.id,
    ]);

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
        [
            body.text,
            body.color,
            body.email,
            req.params.id,
        ],
    );

    res.json(
        buds.rows,
    );
});
