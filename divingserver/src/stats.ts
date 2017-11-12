import * as express from "express";
import { QueryResult } from "pg";
import { database } from "./pg";

export const router  = express.Router();

router.get("/buddies", async (req, res) => {

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
        [
            req.user.user_id,
        ],
    );

    res.json(
        stats.rows,
    );
});

router.get("/tags", async (req, res) => {

    const stats = await database.call(
        `
        select
              t.tag_id
            , t.text
            , t.color
            , (select count(*) from dive_tags d_t where tag.tag_id = d_t.tag_id) as dive_count
            , (
                select max(d.date)
                    from dive_tags d_t
                    join dives d on d.dive_id = d_t.dive_id
                where tag.tag_id = d_t.tag_id
            ) as last_dive
          from tags tag
         where tag.user_id = $1
        `,
        [
            req.user.user_id,
        ],
    );

    res.json(
        stats.rows,
    );
});

router.get("/tags", async (req, res) => {

    const stats = await database.call(
        `
        select
                t.tag_id
            , t.text
            , t.color
            , (select count(*) from dive_tags d_t where tag.tag_id = d_t.tag_id) as dive_count
            , (
                select max(d.date)
                    from dive_tags d_t
                    join dives d on d.dive_id = d_t.dive_id
                where tag.tag_id = d_t.tag_id
            ) as last_dive
            from tags tag
            where tag.user_id = $1
        `,
        [
            req.user.user_id,
        ],
    );

    res.json(
        stats.rows,
    );
});

router.get("/places", async (req, res) => {

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
        `, [
            req.user.user_id,
        ],
    );

    res.json(
        stats.rows,
    );

});
