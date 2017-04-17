import * as bodyParser from "body-parser";
import * as express from "express";
import * as dives from "./dives";
import * as imp from "./import";
import { DbAdapter } from "./pg";

const app = express();
app.use(bodyParser.json({ limit: "500mb" }));
app.use("/:session/dive/", dives.router);
app.use("/:session/import/", imp.router);
app.param("session", (req, res, next, id) => {
    res.locals.session = id;
    next();
});
const db = new DbAdapter();
app.locals.db = db;

async function start() {
    await db.connect();
    await new Promise((resolve, reject) => {
        app.listen(3000, (err) => {
            if (err) {
                reject(err);
            } else {
                resolve();
            }
        });
    });
    console.log('DiveServer listening on 3000');
}

start();