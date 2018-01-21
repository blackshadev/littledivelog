import * as argon2 from "argon2";
import * as express from "express";
import * as Router from "express-promise-router";
import * as jwt from "express-jwt";
import { QueryResult } from "pg";
import { config } from "../config";
import { HttpError } from "../errors";
import { createToken, getToken, verifyAsync } from "../jwt";
import { database } from "../pg";

export const router = Router() as express.Router;

export interface IUserRow {
    user_id: number;
    name: string;
    email: string;
}

function invalidCredentials(res: express.Response): void {
    res.status(401);
    res.json({
        error: "Invalid credentials",
    });
}

function sendError(err: Error, res: express.Response): void {
    res.status(500);
    res.json({
        error: err.message,
    });
}

export async function login(
    email: string,
    password: string,
): Promise<IUserRow> {
    const user = await database.call(
        `
            select
                  user_id
                , email
                , name
                , password
              from users
             where email = $1
        `,
        [email],
    );

    if (!user.rows.length) {
        throw new HttpError(401, "Invalid credentials");
    }

    if (!await argon2.verify(user.rows[0].password, password)) {
        throw new HttpError(401, "Invalid credentials");
    }

    return {
        email: user.rows[0].email,
        name: user.rows[0].name,
        user_id: user.rows[0].user_id,
    };
}

router.post("/", async (req, res) => {
    const b = req.body;

    try {
        const user = await login(b.email, b.password);

        const tok = await createToken({
            user_id: user.user_id,
        });

        res.json({
            jwt: tok,
        });
    } catch (err) {
        res.status(err.message === "Invalid credentials" ? 401 : 500);
        res.json({
            error: err.message,
        });
    }
});

router.post("/refresh-token", async (req, res) => {
    const b = req.body;

    const user = await login(b.email, b.password);

    const dt = await database.call(
        `
            insert
              into session_tokens
                   (user_id, insert_ip, description)
            values ($1     , $2       , $3)
            returning *
        `,
        [user.user_id, req.socket.remoteAddress, b.description || null],
    );
    if (!dt.rows[0]) {
        throw new Error(
            "Unexpected result from databse; unable to insert and get refrehs token",
        );
    }

    const tok = await createToken(
        {
            refresh_token: dt.rows[0].token,
            user_id: user.user_id,
        },
        {
            subject: "refresh-token",
            expiresIn: "1w",
        },
    );

    res.json({
        jwt: tok,
    });
});

router.get(
    "/access-token",
    jwt({
        secret: config.jwt.secret,
        issuer: config.jwt.issuer,
        subject: "refreh-token",
        algorithms: ["HS512"],
    }),
    async (req, res) => {
        // const dat = await verifyAsync(getToken(req), config.jwt.secret, {
        //     subject: "refresh-token",
        //     issuer: config.jwt.issuer,
        //     algorithms: ["HS512"],
        // });
        const dat = req.user;

        const q = await database.call(
            `
            update session_tokens
               set last_used = (current_timestamp at time zone 'UTC')
                 , last_ip =  $3
             where user_id = $1
               and token = $2
         returning *
        `,
            [dat.user_id, dat.refresh_token, req.socket.remoteAddress],
        );

        if (!q.rows.length) {
            throw new HttpError(401, "Invalid token given");
        }

        const tok = await createToken(
            { user_id: dat.user_id },
            {
                expiresIn: "1m", // needs to be higher
                subject: "access-token",
            },
        );

        res.json({ jwt: tok });
    },
);

router.post("/register/", async (req, res) => {
    try {
        if (!(req.body.password && req.body.name && req.body.email)) {
            throw new Error("Password, email and name required");
        }

        const hash = await argon2.hash(req.body.password);

        const db = await database.call(
            `
                    insert into users
                                (email, password, name)
                        values  ($1, $2, $3)
                        returning user_id
                `,
            [req.body.email, hash, req.body.name],
        );

        res.json({
            user_id: db.rows[0].user_id,
        });
    } catch (err) {
        res.status(err.message === "Invalid credentials" ? 401 : 500);
        res.json({
            error: err.message,
        });
    }
});
