const $pg = require("./build/pg.js");
const $pgStrm = require("pg-copy-streams");
desc("Reset dives");
task("reset-dives", { async: true }, async function() {
    const targetDb = new $pg.DbAdapter();
    const srcDb = new $pg.DbAdapter();
    targetDb.setConfig(require("./config.json").database);

    await targetDb.start();

    const res = await $pg.database.call("SELECT * FROM dives");
    // select * from dblink('dbname=divelog user=dive.littledev.nl password=x', 'select * from dives') as t(dive_id int, user_id int, date timestamp, divetime int, max_depth numeric(6,3), samples json, county_code char(2), place_id int, tanks tank[], updated timestamp, inserted timestamp, fingerprint text, computer_id int)
    console.log(res);

    await targetDb.stop();
    this.complete();
});

desc("Clear all tables");
task("clear-db", { async: true }, async function() {
    const targetDb = new $pg.DbAdapter();
    targetDb.setConfig(require("./config.json").database);
    await targetDb.start();

    const sourceDb = new $pg.DbAdapter();
    sourceDb.setConfig({
        host: "yildun.littledev.nl",
        database: "divelog",
        username: "dive.littledev.nl",
        password: process.env["password"],
    });
    await sourceDb.start();

    await targetDb.call(`
        truncate table dives cascade;
        truncate table buddies cascade;
        truncate table tags cascade;
        truncate table places cascade;
    `);

    async function copyTable(srcCl, trgCl, tab) {
        return new Promise((res, rej) => {
            const srcStrm = srcCl.query($pgStrm.to(`COPY ${tab} TO STDOUT`));
            const dstStrm = trgCl.query($pgStrm.from(`COPY ${tab} FROM STDIN`));

            srcStrm.on("error", rej);
            dstStrm.on("error", rej);
            dstStrm.on("end", res);
            srcStrm.pipe(dstStrm);
        });
    }

    const srcCl = await sourceDb.getConnection();
    const trgCl = await targetDb.getConnection();

    let error;
    try {
        await copyTable(srcCl, trgCl, "buddies");
        await copyTable(srcCl, trgCl, "tags");
        await copyTable(srcCl, trgCl, "places");
        await copyTable(srcCl, trgCl, "computers");
        await copyTable(srcCl, trgCl, "dives");
        await copyTable(srcCl, trgCl, "dive_tags");
        await copyTable(srcCl, trgCl, "dive_buddies");
    } catch (err) {
        console.error(err);
        error = err;
    }

    srcCl.release(error);
    trgCl.release(error);

    await sourceDb.stop();
    await targetDb.stop();

    this.complete();
});
