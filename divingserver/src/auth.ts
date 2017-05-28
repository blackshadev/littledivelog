import { QueryResult } from "@types/pg";
import * as argon2 from "argon2";
import * as express from "express";
import { createToken } from "./jwt";
import { database } from "./pg";

export const router  = express.Router();

export interface IUserRow {
    user_id: number;
    username: string;
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

export async function login(email: string, password: string) {
    const user = await database.call(`
            select
                  user_id
                , username
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
        user_id: user.rows[0].user_id,
        username: user.rows[0].username,
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
                data: tok,
            });
        } catch (err) {
            res.status(err.message === "Invalid credentials" ? 401 : 500);
            res.json({
                error: err.message,
            });
        }
    },
);

// router.post(
//     "/register",
//     async (req, res) => {
//         const salt = await argon2.generateSalt();

//         const hash = await argon2.hash(
//             req.body.password,
//             salt,
//         );

//         res.json(hash);
//     },
// );
