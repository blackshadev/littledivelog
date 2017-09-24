import * as bodyParser from "body-parser";
import * as express from "express";
import * as jwt from "express-jwt";
import * as unless from "express-unless";
import { QueryResult } from "pg";
import * as auth from "./auth";
import * as buddies from "./buddies";
import * as computers from "./computers";
import * as dives from "./dives";
import * as imp from "./import";
import { options, secret } from "./jwt.config";
import { database } from "./pg";
import * as places from "./places";
import * as tags from "./tags";

const app = express();
app.use(bodyParser.json({ limit: "500mb" }));

app.use(
    jwt({
        issuer: options.issuer,
        secret,
    }).unless({ path: ["/auth/"] }),
);

app.use("/auth/", auth.router);
app.use("/dive/", dives.router);
app.use("/tag/", tags.router);
app.use("/buddy/", buddies.router);
app.use("/place/", places.router);
app.use("/import/", imp.router);
app.use("/computer/", computers.router);

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
    console.log("ERR", err);
    if (err.name === "UnauthorizedError") {
        res.status(401).json({ error: "Invalid JWT token. Please authenticate first." });
    } else if (err.name === "BodyValidationError") {
        res.status(400).json({ error: err.toString() });
    } else {
        res.status(500).json({ error: err.toString() });
    }
    next();
});

async function start() {
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

start();
