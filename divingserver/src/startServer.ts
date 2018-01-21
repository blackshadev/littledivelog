import * as bodyParser from "body-parser";
import * as express from "express";
import * as jwt from "express-jwt";
import * as expressLogging from "express-logging";
import * as unless from "express-unless";
import { QueryResult } from "pg";
import { config, readConfig } from "./config";
import { HttpError } from "./errors";
import { database } from "./pg";

export async function start(pmx?: any) {
    const path = process.env.CONFIG || process.cwd() + "/config.json";
    console.log("Reading config: " + path);
    await readConfig(path);

    console.log("Starting database on " + config.database.host);
    database.setConfig(config.database);
    await database.start();

    console.log("Setting up expres");
    const app = express();
    app.use(expressLogging(console));
    app.use(bodyParser.json({ limit: "500mb" }));

    app.use(
        jwt({
            issuer: config.jwt.issuer,
            secret: config.jwt.secret,
        }).unless({
            path: [
                "/auth/",
                "/auth/register/",
                "/auth/refresh-token",
                "/auth/access-token",
                "/dive-uploader/download",
            ],
        }),
    );

    const auth = require("./routes/auth");
    const buddies = require("./routes/buddies");
    const computers = require("./routes/computers");
    const dives = require("./routes/dives");
    const places = require("./routes/places");
    const tags = require("./routes/tags");
    const uploader = require("./routes/uploader");
    const user = require("./routes/user");

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

        res.json(ctry.rows);
    });

    app.param("session", (req, res, next, id) => {
        res.locals.session = id;
        next();
    });

    app.use(
        (
            err: Error,
            req: express.Request,
            res: express.Response,
            next: express.NextFunction,
        ) => {
            if (err instanceof HttpError) {
                res.status(err.code).json({ error: err.message });
            } else if (err.name === "UnauthorizedError") {
                res.status(401).json({
                    error: "Invalid JWT token: " + err.message,
                });
            } else if (err.name === "BodyValidationError") {
                res.status(400).json({ error: err.toString() });
            } else {
                res.status(500).json({ error: err.toString() });
            }
            next();
        },
    );

    await new Promise((resolve, reject) => {
        app.listen(config.http.port, err => {
            if (err) {
                reject(err);
            } else {
                resolve();
            }
        });
    });
    console.log("DiveServer listening on 3000");
}
