import { SqlBatch } from "../sql";
import { ITag, IBuddy, IPlace, ITank } from "../interfaces";

export function injectPlaceSql(oPar: { batch: SqlBatch; place: IPlace }): void {
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

export function injectBuddySql(oPar: {
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

export function injectTagSql(oPar: {
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

export function tanksJSONtoType(tanks: ITank[]): string {
    return `{${tanks
        .map(tank => {
            // tslint:disable-next-line:max-line-length
            return `"(${isNullOrRound(tank.volume)},${isNullOrRound(
                tank.oxygen,
            )},\\"(${isNullOrRound(tank.pressure.begin)},${isNullOrRound(
                tank.pressure.end,
            )},${isNull(tank.pressure.type)})\\")"`;
        })
        .join(",")}}`;
}

function isNull(v: any): any {
    return v === null || v === undefined ? "" : v;
}

function isNullOrRound(v: any): any {
    return v === null || v === undefined ? "" : Math.round(v);
}
