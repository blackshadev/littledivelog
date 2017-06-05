import { QueryResult } from "@types/pg";
import * as argon2 from "argon2";
import * as express from "express";
import { createToken } from "./jwt";
import { database } from "./pg";

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
        console.error("Invalid username");
        throw new Error("Invalid credentials");
    }
    console.log("valid username");

    if (!await argon2.verify(user.rows[0].password, password) ) {
        console.error("Invalid passwd");
        throw new Error("Invalid credentials");
    }
    console.log("valid passwd");

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
                data: tok,
            });
            console.log("here");
        } catch (err) {
            console.error(err);
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
