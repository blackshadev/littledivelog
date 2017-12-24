import * as argon2 from "argon2";
import * as express from "express";
import { QueryResult } from "pg";
import { createToken } from "../jwt";
import { database } from "../pg";

export const router  = express.Router();

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

export async function login(email: string, password: string): Promise<IUserRow> {
    const user = await database.call(`
            select
                  user_id
                , email
                , name
                , password
              from users
             where email = $1
        `, [
        email,
    ]);

    if (!user.rows.length) {
        throw new Error("Invalid credentials");
    }

    if (!await argon2.verify(user.rows[0].password, password) ) {
        throw new Error("Invalid credentials");
    }

    return {
        email: user.rows[0].email,
        name: user.rows[0].name,
        user_id: user.rows[0].user_id,
    };
}

router.post(
    "/",
    async (req, res) => {
        const b = req.body;

        try {
            const user = await login(b.email, b.password);

            const tok = await createToken(
                {
                    user_id: user.user_id,
                },
            );

            res.json({
                jwt: tok,
            });
        } catch (err) {
            res.status(err.message === "Invalid credentials" ? 401 : 500);
            res.json({
                error: err.message,
            });
        }
    },
);

router.post(
    "/register/",
    async (req, res) => {

        try {
            if (!(
                req.body.password &&
                req.body.name &&
                req.body.email
            )) {
                throw new Error("Password, email and name required");
            }

            const hash = await argon2.hash(
                req.body.password,
            );

            const db = await database.call(
                `
                    insert into users
                                (email, password, name)
                        values  ($1, $2, $3)
                        returning user_id
                `,
                [
                    req.body.email,
                    hash,
                    req.body.name,
                ],
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

    },
);