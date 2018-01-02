import * as bodyParser from "body-parser";
import * as express from "express";
import * as jwt from "express-jwt";
import * as expressLogging from "express-logging";
import * as unless from "express-unless";
import { QueryResult } from "pg";
import { options, secret } from "./jwt.config";
import { database } from "./pg";
import * as auth from "./routes/auth";
import * as buddies from "./routes/buddies";
import * as computers from "./routes/computers";
import * as dives from "./routes/dives";
import * as places from "./routes/places";
import * as tags from "./routes/tags";
import * as uploader from "./routes/uploader";
import * as user from "./routes/user";

export async function start(pmx?: any) {

    const app = express();
    app.use(expressLogging(console));
    app.use(bodyParser.json({ limit: "500mb" }));

    app.use(
        jwt({
            issuer: options.issuer,
            secret,
        }).unless({ path: ["/auth/", "/auth/register/", "/dive-uploader/download"] }),
    );

    app.use("/auth/", auth.router);
    app.use("/dive/", dives.router);
    app.use("/tag/", tags.router);
    app.use("/buddy/", buddies.router);
    app.use("/place/", places.router);
    app.use("/computer/", computers.router);
    app.use("/user/", user.router);
    app.use("/dive-uploader/", uploader.router);

    app.get("/country", async (req, res) => {
        const ctry: QueryResult = await database.call(
            `select ctry.*
            from countries ctry
            `,
            [],
        );

        res.json(
            ctry.rows,
        );
    });

    app.param("session", (req, res, next, id) => {
        res.locals.session = id;
        next();
    });

    app.use((err, req, res, next) => {
        if (err.name === "UnauthorizedError") {
            res.status(401).json({ error: "Invalid JWT token. Please authenticate first." });
        } else if (err.name === "BodyValidationError") {
            res.status(400).json({ error: err.toString() });
        } else {
            res.status(500).json({ error: err.toString() });
        }
        next();
    });

    await new Promise((resolve, reject) => {
        app.listen(3000, (err) => {
            if (err) {
                reject(err);
            } else {
                resolve();
            }
        });
    });
    console.log("DiveServer listening on 3000");
}
