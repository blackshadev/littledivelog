import * as argon2 from "argon2";
import * as express from "express";
import * as Router from "express-promise-router";
import { QueryResult } from "pg";
import { createToken } from "../jwt";
import { database } from "../pg";
import { HttpError } from "../errors";

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

    const tok = await createToken(
        {
            user_id: user.user_id,
        },
        "1w",
    );
});

router.get("/access-token", async (req, res) => {
    const auth = req.headers["Authorization"] as string;
    if (!auth) {
        throw new HttpError(
            400,
            "Exptected authorization header with basic type and user_id + refresh token",
        );
    }

    const [type, encAuthContent, ...rest] = auth.split(" ");
    if (rest.length !== 0) {
        throw new HttpError(
            400,
            "Invalid authorization header content, expected basic type and token",
        );
    }
    if (type.toLowerCase() !== "basic") {
        throw new HttpError(
            400,
            "Invalid authorization header content, expected type to be basic",
        );
    }

    const uidToken = Buffer.from(encAuthContent, "base64").toString();
    const [uid, token] = uidToken.split(":");

    const q = await database.call(
        `
            update session_tokens
               set last_used = (current_timestamp at time zone 'UTC')
                 , last_ip =  $3
             where user_id = $1
               and token = $2
         returning *
        `,
        [uid, token, req.socket.remoteAddress],
    );

    if (!q.rows.length) {
        throw new HttpError(401, "Invalid token given");
    }

    const tok = await createToken(
        { user_id: uid },
        "1m", // needs to be higher
    );

    res.json({ token: tok });
});

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
