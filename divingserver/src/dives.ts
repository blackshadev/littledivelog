import * as express from "express";

export const router  = express.Router();

router.get("/", (req, res) => {
    res.json([
        res.locals.session,
        "thinges",
    ]);
});

router.get("/:id", (req, res) => {
    console.log("locals", res.locals);

    res.json({
        dive_id: req.params.id,
        session: res.locals.session,
    });
});

