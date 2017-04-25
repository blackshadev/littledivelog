import * as bodyParser from "body-parser";
import * as express from "express";
import * as buddies from "./buddies";
import * as dives from "./dives";
import * as imp from "./import";
import { database } from "./pg";
import * as tags from "./tags";

const app = express();
app.use(bodyParser.json({ limit: "500mb" }));
app.use("/:session/dive/", dives.router);
app.use("/:session/tag/", tags.router);
app.use("/:session/buddy/", buddies.router);
app.use("/:session/import/", imp.router);
app.param("session", (req, res, next, id) => {
    res.locals.session = id;
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
