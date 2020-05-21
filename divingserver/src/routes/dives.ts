import { QueryResult } from "pg";
import {
    injectBuddySql,
    injectPlaceSql,
    injectTagSql,
    tanksJSONtoType,
} from "../db/helpers";
import { getComputerPrefered, max, mergeSamples, min } from "../diveFunctions";
import { HttpError } from "../errors";
import { Router } from "../express-promise-router";
import { IAuthenticatedRequest } from "../express.interface";
import { IBatchDive, IBuddy, IDive, IPlace, ITag } from "../interfaces";
import { database } from "../pg";
import { SqlBatch } from "../sql";

export const router = Router();

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
        select ${flds.map((f) => fld_map[f]).join(",")}
          from dives d
          left join places p on p.place_id = d.place_id
         where d.user_id = $1
           and ${where}
      order by d.date desc
    `;
}

router.get("/", async (req: IAuthenticatedRequest, res) => {
    let filterSql = "1=1";

    const pars: string[] = [req.user.user_id + ""];

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
    if (typeof req.query.till === "string") {
        pars.push(req.query.till);
        filterSql += ` and d.date < $${pars.length}::date`;
    }
    if (typeof req.query.from === "string") {
        pars.push(req.query.from);
        filterSql += ` and d.date > $${pars.length}::date`;
    }
    if (typeof req.query.date === "string") {
        pars.push(req.query.date);
        filterSql += ` and d.date::date = $${pars.length}::date`;
    }
    if (typeof req.query.place === "string") {
        pars.push(`${req.query.place}`);
        filterSql += ` and d.place_id = $${pars.length}::integer`;
    }
    if (typeof req.query.country === "string") {
        pars.push(req.query.country);
        filterSql += ` and p.country_code = upper($${pars.length})`;
    }

    const dives: QueryResult = await database.call(
        diveQuery(["dive_id", "divetime", "date", "tags", "place"], filterSql),
        pars,
    );

    res.json(dives.rows);
});

router.get("/:id", async (req: IAuthenticatedRequest, res) => {
    const dives: QueryResult = await database.call(
        diveQuery("*", "d.dive_id = $2"),
        [req.user.user_id, req.params.id],
    );

    res.json(dives.rows[0]);
});

router.delete("/:id", async (req: IAuthenticatedRequest, res) => {
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

router.put("/:id", async (req: IAuthenticatedRequest, res) => {
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

    batch.add(sql, params, (ds) => {
        if (ds.rowCount !== 1) {
            throw new Error("Unable to update given dive");
        }
    });

    const diveId = parseInt(req.params.id, 10);

    if (body.buddies) {
        batch.add("delete from dive_buddies where dive_id=$1", [req.params.id]);
        injectBuddySql({
            buddies: body.buddies,
            diveId,
            userId: userid,
            batch,
        });
    }
    if (body.tags) {
        batch.add("delete from dive_tags where dive_id=$1", [req.params.id]);
        injectTagSql({
            diveId,
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

router.post("/", async (req: IAuthenticatedRequest, res) => {
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
    const params = flds.map((fld) => body[fld]);

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

    batch.add(sql, params, (ds) => {
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

router.post("/merge", async (req: IAuthenticatedRequest, res) => {
    await SqlBatch.transaction(async (cl) => {
        let qsIds = req.query.ids as string[];
        if (
            !qsIds ||
            !Array.isArray(qsIds) ||
            qsIds.length === 0 ||
            qsIds.filter((a) => isNaN(parseInt(a, 10))).length !== 0
        ) {
            throw new HttpError(
                400,
                "Expected query parameters ids to be an array of numbers",
            );
        }

        let dives: IDive[];
        const ids: number[] = qsIds.map((n) => Number(n));

        const res = await cl.query(
            `select
                    dive_id
                  , divetime
                  , date
                  , to_json(tanks) as tanks
                  , samples::json
                  , max_depth::float
                  , place_id
                  , country_code
                  , computer_id
                  from dives
                where dive_id = any($1::int[])
                  and user_id = $2
                order by date asc
                `,
            [ids, req.user.user_id],
        );
        dives = res.rows as IDive[];
        if (req.query.ids.length !== dives.length) {
            const _ids = new Set(dives.map((d) => d.dive_id));
            const nonExistent = ids.filter((id) => !_ids.has(id));
            throw new Error(
                "The following dives did not exist: " + nonExistent.join(", "),
            );
        }

        // TODO
        let dive: Omit<IDive, "dive_id"> = dives[0];
        for (let iX = 1; iX < dives.length; iX++) {
            const dive1 = dive;
            const dive2: IDive = dives[iX];
            if (
                dive1.computer_id &&
                dive2.computer_id &&
                dive1.computer_id !== dive2.computer_id
            ) {
                throw new Error(
                    "Unable to merge dives from different computers",
                );
            }

            if (
                dive1.place_id &&
                dive2.place_id &&
                dive1.place_id !== dive2.place_id
            ) {
                throw new Error("Unable to merge dives from different places");
            }

            const timeDiff = Math.abs(
                new Date(dive1.date).valueOf() - new Date(dive2.date).valueOf(),
            );
            const HOUR_IN_MS = 1000 * 60 * 60;
            if (timeDiff > HOUR_IN_MS) {
                throw new Error(
                    "Unable to merge dives which are more than 1 hour apart",
                );
            }

            dive = {
                computer_id: 1,
                country_code: "",
                date: "",
                divetime: 0,
                max_depth: 0,
                place_id: 0,
                samples: [],
                tanks: [],
                user_id: req.user.user_id,
            };
            dive.computer_id = dive1.computer_id || dive2.computer_id;
            dive.country_code = dive1.country_code || dive2.country_code;
            dive.place_id = dive1.place_id || dive2.place_id;
            dive.date = getComputerPrefered([dive1, dive2], "date", min);
            dive.max_depth = getComputerPrefered(
                [dive1, dive2],
                "max_depth",
                max,
            );

            dive.divetime =
                dive1.computer_id || dive2.computer_id
                    ? (dive1.computer_id ? dive1.divetime : 0) +
                      (dive2.computer_id ? dive2.divetime : 0)
                    : dive1.divetime + dive2.divetime;

            if (dive1.computer_id && dive2.computer_id) {
                const merged = mergeSamples(dive1, dive2);
                dive.samples = merged.samples;
                dive.divetime = merged.divetime;
            } else {
                dive.samples = dive1.computer_id
                    ? dive1.samples
                    : dive2.samples;
            }

            if (
                dive1.tanks[0] &&
                dive2.tanks[0] &&
                dive1.tanks[0].pressure.type !== dive2.tanks[0].pressure.type
            ) {
                throw new Error(
                    "Unable to merge dives with different tank pressure types",
                );
            }

            if (
                dive1.tanks[0] &&
                dive2.tanks[0] &&
                dive1.tanks[0].volume !== dive2.tanks[0].volume
            ) {
                throw new Error(
                    "Unable to merge dives with different tank volumes",
                );
            }

            if (
                dive1.tanks[0] &&
                dive2.tanks[0] &&
                dive1.tanks[0].oxygen !== dive2.tanks[0].oxygen
            ) {
                throw new Error(
                    "Unable to merge dives with different oxygen levels",
                );
            }

            dive.user_id = req.user.user_id;
            dive.tanks = [
                {
                    oxygen: dive1.tanks[0].oxygen || dive2.tanks[0].oxygen,
                    volume: dive1.tanks[0].volume || dive2.tanks[0].volume,
                    pressure: {
                        begin: getComputerPrefered(
                            [
                                {
                                    computer_id: dive1.computer_id,
                                    pres: dive1.tanks[0].pressure.begin,
                                },
                                {
                                    computer_id: dive2.computer_id,
                                    pres: dive2.tanks[0].pressure.begin,
                                },
                            ],
                            "pres",
                            max,
                        ),
                        end: getComputerPrefered(
                            [
                                {
                                    computer_id: dive1.computer_id,
                                    pres: dive1.tanks[0].pressure.end,
                                },
                                {
                                    computer_id: dive2.computer_id,
                                    pres: dive2.tanks[0].pressure.end,
                                },
                            ],
                            "pres",
                            min,
                        ),
                        type:
                            dive1.tanks[0].pressure.type ||
                            dive2.tanks[0].pressure.type,
                    },
                },
            ];
        }

        const insRes = await cl.query(
            `
            INSERT INTO dives (user_id, date, divetime, max_depth, samples, tanks, place_id, country_code, computer_id)
                 VALUES ($1, $2::timestamp, $3::int, $4::numeric(6,3), $5, $6::tank[], $7::int, $8, $9::int)
              RETURNING dive_id`,
            [
                req.user.user_id,
                dive.date,
                dive.divetime,
                dive.max_depth,
                JSON.stringify(dive.samples),
                tanksJSONtoType(dive.tanks),
                dive.place_id,
                dive.country_code,
                dive.computer_id,
            ],
        );
        const newDiveId = insRes.rows[0].dive_id as number;

        // TODO: insert and merge all tags and buddies
        await cl.query(
            `
            INSERT INTO dive_tags (dive_id, tag_id)
                 SELECT distinct $1::int, tag_id
                   FROM dive_tags dt1
                  WHERE dive_id = any($2::int[])
        `,
            [newDiveId, qsIds],
        );

        await cl.query(
            `
            INSERT INTO dive_buddies (dive_id, buddy_id)
                 SELECT distinct $1::int, buddy_id
                   FROM dive_buddies db1
                  WHERE dive_id = any($2::int[])
        `,
            [newDiveId, qsIds],
        );

        await cl.query(
            "DELETE FROM dive_buddies WHERE dive_id = any($1::int[])",
            [qsIds],
        );
        await cl.query("DELETE FROM dive_tags WHERE dive_id = any($1::int[])", [
            qsIds,
        ]);
        await cl.query("DELETE FROM dives WHERE dive_id = any($1::int[])", [
            qsIds,
        ]);
    });

    res.json({});
});

router.get("/:id/samples", async (req: IAuthenticatedRequest, res) => {
    const samples: QueryResult = await database.call(
        "select samples from dives d where d.user_id = $1 and dive_id=$2",
        [req.user.user_id, req.params.id],
    );

    res.json(samples.rows.length ? samples.rows[0].samples || [] : []);
});

router.post("/batch", async (req: IAuthenticatedRequest, res) => {
    const data = req.body as IBatchDive[];

    const diveIds: number[] = [];
    await SqlBatch.transaction(async (cl) => {
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
                            , ($2::timestamp) as date
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
