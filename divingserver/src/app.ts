import * as bodyParser from "body-parser";
import * as express from "express";
import * as dives from "./dives";

const app = express();
app.use(bodyParser.json());
app.use("/:session/dive/", dives.router);
app.param("session", (req, res, next, id) => {
    console.log("adding session to locals");
    res.locals.session = id;
    next();
});

app.listen(3000, () => {
  console.log('Example app listening on port 3000!')
});
