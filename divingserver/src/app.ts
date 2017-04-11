import * as bodyParser from "body-parser";
import * as express from "express";
import * as dives from "./dives";
import * as db from "./pg";

const app = express();
app.use(bodyParser.json());
app.use("/:session/dive/", dives.router);
app.param("session", (req, res, next, id) => {
    console.log("adding session to locals");
    res.locals.session = id;
    next();
});
app.locals.dbcall = db.call;

async function start() {
    await db.connect();
    console.log("Connected to db")
    await new Promise((resolve, reject) => {
        app.listen(3000, (err) => {
            if (err) {
                reject(err);
            } else {
                resolve();
            }
        });
    });
    console.log('Example app listening on port 3000!')
}

start();
