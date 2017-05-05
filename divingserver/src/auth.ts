import { QueryResult } from "@types/pg";
import * as argon2 from "argon2";
import * as express from "express";
import * as jwt from "jsonwebtoken";
import { options, secret } from "./jwt.config";
import { database } from "./pg";

export const router  = express.Router();

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

router.post(
    "/",
    async (req, res) => {
        const b = req.body;

        const user = await database.call(`
            select user_id, password
              from users
             where email = $1
        `, [
            b.email,
        ]);

        if (!user.rows.length) {
            invalidCredentials(res);
            return;
        }

        try {
            if (!await argon2.verify(user.rows[0].password, b.password) ) {
                invalidCredentials(res);
                return;
            }
        } catch (err) {
            sendError(err, res);
            return;
        }

        jwt.sign(
            {
                user_id: user.rows[0].user_id,
            },
            secret,
            {
                algorithm: "HS512",
                issuer: options.issuer,
            },
            (err, dat) => {
                if (err) {
                    res.status(500);
                    res.json({
                        error: err.message,
                    });
                }
                res.json({
                    jwt: dat,
                });
            },
        );
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
