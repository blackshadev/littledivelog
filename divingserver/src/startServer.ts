import * as bodyParser from "body-parser";
import * as cors from "cors";
import * as express from "express";
import * as jwt from "express-jwt";
import * as expressLogging from "express-logging";
import { QueryResult } from "pg";
import { config, readConfig, envVariableConfig } from "./config";
import { HttpError } from "./errors";
import { database } from "./pg";

export async function start() {
    const path = process.env.CONFIG;
    if (path) {
        console.log("Reading config: " + path);
        await readConfig(path);
    } else {
        await envVariableConfig();
    }

    console.log("Starting database on " + config.database.host);
    database.setConfig(config.database);
    await database.start();

    console.log("Setting up express");
    const app = express();

    if (config.http.proxy) {
        console.log("Use with proxy: ", config.http.proxy);
        app.set("trust proxy", config.http.proxy);
    }
    if (config.cors) {
        app.use(cors());
    }

    app.use(expressLogging(console));
    app.use(bodyParser.json({ limit: "500mb" }));

    app.use(
        jwt({
            issuer: config.jwt.issuer,
            secret: config.jwt.secret,
            algorithms: ['HS512'],
        }).unless({
            path: [
                "/auth/",
                "/auth/register/",
                {
                    url: "/auth/refresh-token",
                    methods: ["POST", "DELETE", "OPTIONS"],
                },
                "/auth/access-token",
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
            console.error("Error", err);
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
        app.listen(config.http.port, () => {
            resolve();
        });
    });
    console.log("DiveServer listening on " + config.http.port);
}
