import { QueryResult } from "pg";
import { Router } from "../express-promise-router";
import { database } from "../pg";
import { SqlBatch } from "../sql";
import { ITank, tanksJSONtoType } from "../tansforms";

export const router = Router();

interface IBuddy {
    buddy_id?: number;
    text: string;
    color: string;
}

interface ITag {
    tag_id?: number;
    text: string;
    color: string;
}

interface IPlace {
    place_id?: number;
    name: string;
    country_code: string;
}

function injectPlaceSql(oPar: { batch: SqlBatch; place: IPlace }): void {
    if (!oPar.place.place_id) {
        oPar.batch.add(
            "insert into places (name, country_code) values ($1, $2) returning *",
            [oPar.place.name, oPar.place.country_code],
            res => {
                oPar.place.place_id = res.rows[0].place_id;
            },
        );
    }
}

function injectBuddySql(oPar: {
    userId: number;
    diveId: number | (() => number);
    batch: SqlBatch;
    buddies: IBuddy[];
}): void {
    oPar.buddies.forEach(buddy => {
        if (buddy.buddy_id !== undefined) {
            return;
        }

        oPar.batch.add(
            "insert into buddies (text, color, user_id) values ($1, $2, $3) returning *",
            [buddy.text, buddy.color, oPar.userId],
            ds => {
                buddy.buddy_id = ds.rows[0].buddy_id;
            },
        );
    });

    oPar.buddies.forEach(buddy => {
        oPar.batch.add(
            "insert into dive_buddies (dive_id, buddy_id) values ($1, $2)",
            [oPar.diveId, () => buddy.buddy_id],
        );
    });
}

function injectTagSql(oPar: {
    userId: number;
    diveId: number | (() => number);
    batch: SqlBatch;
    tags: ITag[];
}): void {
    oPar.tags.forEach(tag => {
        if (tag.tag_id !== undefined) {
            return;
        }

        oPar.batch.add(
            "insert into tags (text, color, user_id) values ($1, $2, $3) returning *",
            [tag.text, tag.color, oPar.userId],
            ds => {
                tag.tag_id = ds.rows[0].tag_id;
            },
        );
    });

    oPar.tags.forEach(tag => {
        oPar.batch.add(
            "insert into dive_tags (dive_id, tag_id) values ($1, $2)",
            [oPar.diveId, () => tag.tag_id],
        );
    });
}

const fld_map = {
    dive_id: "dive_id",
    date: "date",
    divetime: "divetime",
    max_depth: "max_depth",
    place: `(
        '{ "country_code": "' || p.country_code || '",' ||
        '  "place_id": ' || p.place_id || ', ' ||
        '  "name": "' || p.name || '"' ||
        '}'
      )::json as place`,
    buddies: `(
        select COALESCE(array_to_json(array_agg(row_to_json(b))), '[]')
            from (
            select bud.buddy_id, bud.color, bud.text
                from dive_buddies d_b
                join buddies bud on d_b.buddy_id = bud.buddy_id
            where d_b.dive_id = d.dive_id
            ) b
        ) as buddies`,
    tags: `(
        select COALESCE(array_to_json(array_agg(row_to_json(b))), '[]')
            from (
            select tag.tag_id, tag.color, tag.text
                from dive_tags d_t
                join tags tag on d_t.tag_id = tag.tag_id
            where d_t.dive_id = d.dive_id
            ) b
        ) as tags`,
    tanks: `to_json(d.tanks) as tanks`,
};

function diveQuery(flds: string[] | "*", where: string = "") {
    if (flds === "*") {
        flds = Object.keys(fld_map);
    }

    return `
        select ${flds.map(f => fld_map[f]).join(",")}
          from dives d
          left join places p on p.place_id = d.place_id
         where d.user_id = $1
           and ${where}
      order by d.date desc
    `;
}

router.get("/", async (req, res) => {
    let filterSql = "1=1";

    const pars = [req.user.user_id];

    if (req.query.buddies) {
        pars.push(`{${req.query.buddies}}`);
        filterSql += `
            and array(
                select buddy_id
                from dive_buddies d_b
                where d_b.dive_id = d.dive_id
            ) @> $${pars.length}::integer[]
        `;
    }
    if (req.query.tags) {
        pars.push(`{${req.query.tags}}`);
        filterSql += `
            and array(
                select tag_id
                  from dive_tags d_t
                 where d_t.dive_id = d.dive_id
            ) @> $${pars.length}::integer[]
        `;
    }
    if (req.query.till) {
        pars.push(req.query.till);
        filterSql += ` and d.date < $${pars.length}::date`;
    }
    if (req.query.from) {
        pars.push(req.query.from);
        filterSql += ` and d.date > $${pars.length}::date`;
    }
    if (req.query.date) {
        pars.push(req.query.date);
        filterSql += ` and d.date::date = $${pars.length}::date`;
    }
    if (req.query.place) {
        pars.push(`${req.query.place}`);
        filterSql += ` and d.place_id = $${pars.length}::integer`;
    }
    if (req.query.country) {
        pars.push(req.query.country);
        filterSql += ` and p.country_code = upper($${pars.length})`;
    }

    const dives: QueryResult = await database.call(
        diveQuery(["dive_id", "divetime", "date", "tags", "place"], filterSql),
        pars,
    );

    res.json(dives.rows);
});

router.get("/:id", async (req, res) => {
    const dives: QueryResult = await database.call(
        diveQuery("*", "d.dive_id = $2"),
        [req.user.user_id, req.params.id],
    );

    res.json(dives.rows[0]);
});

router.delete("/:id", async (req, res) => {
    const batch = new SqlBatch();

    batch.add(
        `
        delete
          from dive_tags
         where dive_id = $2
           and dive_id in (
                select dive_id from dives d where d.dive_id = $2 and d.user_id = $1
           )
    `,
        [req.user.user_id, req.params.id],
    );
    batch.add(
        `
        delete
          from dive_buddies
         where dive_id = $2
           and dive_id in (
                select dive_id from dives d where d.dive_id = $2 and d.user_id = $1
           )
    `,
        [req.user.user_id, req.params.id],
    );
    batch.add(
        `
        delete from dives where user_id = $1 and dive_id = $2
    `,
        [req.user.user_id, req.params.id],
    );
    const c = await batch.execute();

    res.json(c > 0);
});

router.put("/:id", async (req, res) => {
    const userid = req.user.user_id;

    const body = req.body;

    const batch = new SqlBatch();

    if (body.place) {
        injectPlaceSql({
            batch,
            place: body.place,
        });
    }

    body.tanks = tanksJSONtoType(body.tanks);
    let sql =
        "update dives set updated = (current_timestamp at time zone 'UTC')";
    const flds = ["date", "divetime", "max_depth", "tanks"];
    const params = [];
    for (const fld of flds) {
        sql += `, ${fld} = $${params.push(body[fld])}`;
    }
    if (body.place) {
        sql += `, place_id = $${params.push(() => body.place.place_id)}`;
    }

    sql += ` where dive_id = $${params.push(
        req.params.id,
    )} and user_id = $${params.push(userid)}`;

    batch.add(sql, params, ds => {
        if (ds.rowCount !== 1) {
            throw new Error("Unable to update given dive");
        }
    });

    if (body.buddies) {
        batch.add("delete from dive_buddies where dive_id=$1", [req.params.id]);
        injectBuddySql({
            buddies: body.buddies,
            diveId: req.params.id,
            userId: userid,
            batch,
        });
    }
    if (body.tags) {
        batch.add("delete from dive_tags where dive_id=$1", [req.params.id]);
        injectTagSql({
            diveId: req.params.id,
            tags: body.tags,
            userId: userid,
            batch,
        });
    }

    try {
        await batch.execute();

        res.json({
            dive_id: req.params.id,
        });
    } catch (err) {
        res.statusCode = 500;
        res.json({
            error: "UNEXPECTED-SQL-ERROR",
            messge: err.message,
            stacktrace: err.stack,
        });
    }
});

router.post("/", async (req, res) => {
    const userid = req.user.user_id;

    const body = req.body;
    const batch = new SqlBatch();

    if (body.samples && typeof body.samples === "object") {
        body.samples = JSON.stringify(body.samples);
    }

    body.tanks = tanksJSONtoType(body.tanks);
    body.user_id = userid;

    const flds = [
        "date",
        "divetime",
        "max_depth",
        "tanks",
        "user_id",
        "computer_id",
        "fingerprint",
        "samples",
    ];
    const params = flds.map(fld => body[fld]);

    if (body.place) {
        injectPlaceSql({
            batch,
            place: body.place,
        });
        flds.push("place_id");
        params.push(() => body.place.place_id);
    }

    const sql = `insert into dives
                ( ${flds.join(",")} )
        values  (
            ${flds.map((fld, iX) => "$" + (iX + 1)).join(",")}
        )
        on conflict (computer_id, fingerprint)
          do update
                set updated = now()
        returning dive_id as id, updated, inserted;
    `;
    let diveId: number;
    let skipped: boolean = false;

    batch.add(sql, params, ds => {
        if (ds.rowCount !== 1) {
            throw new Error("Unable to update given dive");
        }

        skipped = ds.rows[0].updated !== ds.rows[0].inserted;
        diveId = ds.rows[0].id;
    });

    if (body.buddies) {
        injectBuddySql({
            buddies: body.buddies,
            diveId: () => diveId,
            userId: userid,
            batch,
        });
    }
    if (body.tags) {
        injectTagSql({
            diveId: () => diveId,
            tags: body.tags,
            userId: userid,
            batch,
        });
    }

    if (body.computer_id && body.fingerprint) {
        batch.add(
            `
           update computers
              set last_fingerprint = $3
                , last_read = $2
            where computer_id = $1
              and coalesce(last_read, '1970-01-01 00:00:00') < $2
        `,
            [body.computer_id, body.date, body.fingerprint],
        );
    }

    await batch.execute();

    res.json({
        dive_id: diveId,
        skipped,
    });
});

router.get("/:id/samples", async (req, res) => {
    const samples: QueryResult = await database.call(
        "select samples from dives d where d.user_id = $1 and dive_id=$2",
        [req.user.user_id, req.params.id],
    );

    res.json(samples.rows.length ? samples.rows[0].samples || [] : []);
});

interface IBatchDive {
    max_depth: number;
    dive_time: number;
    date: Date;
    tags: string[];
    place: {
        country_code: string;
        country: string;
        name: string;
    };
    buddies: string[];
    tanks: ITank[];
}

router.post("/batch", async (req, res) => {
    const data = req.body as IBatchDive[];

    const diveIds: number[] = [];
    await SqlBatch.transaction(async cl => {
        for (const row of data) {
            let rs = await cl.query(
                `
                SELECT coalesce(c1.iso2, c2.iso2) as iso2
                  FROM (
                      SELECT
                          $1::text as country_code
                        , $2::text as country_name
                    ) d
                    left join countries c1 on c1.iso2 = upper(d.country_code)
                    left join countries c2 on lower(c2.name) = lower(d.country_name)
            `,
                [row.place.country_code, row.place.country],
            );

            const countryISO2 = rs.rows[0].iso2;
            if (!countryISO2) {
                throw new Error(
                    `Unable to find ${
                        row.place.country
                            ? `a country named ${row.place.country}`
                            : ``
                    } ${
                        row.place.country_code
                            ? ` with iso2 code ${row.place.country_code}`
                            : ""
                    }. Try using an iso2 code in the country_code field as for example 'NL'`,
                );
            }

            rs = await cl.query(
                `
                with new_row as (
                    INSERT INTO places (country_code, name)
                      SELECT $1::text, $2::text
                       WHERE not exists (SELECT * FROM places where country_code = $1 AND name = $2)
                    returning place_id
                )
                SELECT * FROM new_row
                UNION
                SELECT place_id FROM places WHERE country_code = $1 AND lower(name) = lower($2)
            `,
                [countryISO2, row.place.name],
            );
            const placeId = rs.rows[0].place_id;

            rs = await cl.query(
                `
                INSERT INTO dives (user_id, date, max_depth, divetime, tanks, country_code, place_id)
                SELECT
                        d.user_id
                      , d.date
                      , d.max_depth
                      , d.dive_time
                      , d.tanks
                      , d.country_code
                      , place_id
                  FROM (
                        SELECT $1::int as user_id
                            , ($2::date) as date
                            , $3::numeric(6,3) as max_depth
                            , $4::int as dive_time
                            , $5::tank[] as tanks
                            , $6::text as country_code
                            , $7::int as place_id
                    ) d
                RETURNING dive_id
            `,
                [
                    req.user.user_id,
                    row.date,
                    row.max_depth,
                    row.dive_time,
                    tanksJSONtoType(row.tanks),
                    countryISO2,
                    placeId,
                ],
            );

            const diveId = rs.rows[0].dive_id;

            rs = await cl.query(
                `
                with d as (
                    select distinct name from unnest($1::text[]) as b(name)
                ), new_buddies as (
                    insert into buddies (user_id, text, color)
                    select $2::int, d.name, '#ffffff'  from d
                    where not exists (select * from buddies b where lower(b.text) = lower(d.name) and b.user_id = $2::int )
                    returning buddy_id
                ), all_buddies as (
                    select buddy_id
                      from new_buddies
                    union
                    select b.buddy_id
                      from d d
                      join buddies b on d.name = b.text and b.user_id = $2::int
                )
                insert into dive_buddies (dive_id, buddy_id)
                     select $3::int, buddy_id
                       from all_buddies
            `,
                [row.buddies, req.user.user_id, diveId],
            );

            rs = await cl.query(
                `
                with d as (
                    select distinct name from unnest($1::text[]) as b(name)
                ), new_tags as (
                    insert into tags (user_id, text, color)
                    select $2::int, d.name, '#ffffff'  from d
                    where not exists (select * from tags t where lower(t.text) = lower(d.name) and t.user_id = $2::int )
                    returning tag_id
                ), all_tags as (
                    select tag_id
                      from new_tags
                    union
                    select tag_id
                      from d d
                      join tags t on lower(t.text) = lower(d.name) and t.user_id = $2::int
                )
                insert into dive_tags (dive_id, tag_id)
                     select $3::int, tag_id
                       from all_tags
            `,
                [row.tags, req.user.user_id, diveId],
            );

            diveIds.push(diveId);
        }
    });

    res.json({
        dives: diveIds,
    });
});
