import { hash, verify } from "argon2";
import * as express from "express";
import { QueryResult } from "pg";
import { isPrimitive } from "util";
import { database } from "../pg";
import { SqlBatch } from "../sql";

export const router  = express.Router();

router.get("/profile", async (req, res) => {

    const dat = await database.call(
        `select
                  user_id
                , name
                , email
                , inserted
                , (select count(*) from dives d where d.user_id = u.user_id) as dive_count
                , (select count(*) from computers c where c.user_id = u.user_id) as computer_count
                , (select count(*) from buddies b where b.user_id = u.user_id) as buddy_count
                , (select count(*) from tags t where t.user_id = u.user_id) as tag_count
           from users u
          where user_id = $1
        `,
        [
            req.user.user_id,
        ],
    );

    res.json(dat.rows[0]);
});

router.put("/profile", async (req, res) => {

    const dat = await database.call(
        `
            update users
               set name = $2
             where user_id = $1
        `, [
            req.user.user_id,
            req.body.name,
        ],
    );

    res.json(dat.rowCount > 0);
});

router.put("/profile/password", async (req, res) => {

    const old = await database.call(
        `
            select password
              from users
             where user_id = $1
        `, [
            req.user.user_id,
        ],
    );

    // if (!await verify(old.rows[0].password, req.body.old)) {
    //     res.status(401);
    //     res.json({ msg: "Invalid old password" });
    //     return;
    // }

    if (typeof(req.body.new) !== "string") {
        res.status(400);
        res.json({ msg: "Password required" });
        return;
    }

    if (req.body.new.length < 6) {
        res.status(400);
        res.json({ msg: "Minimum length of password is 6" });
        return;
    }

    req.body.new = await hash(req.body.new);

    const dat = await database.call(
        `
            update users
               set password = $2
             where user_id = $1
        `, [
            req.user.user_id,
            req.body.new,
        ],
    );

    res.json(dat.rowCount > 0);
});
