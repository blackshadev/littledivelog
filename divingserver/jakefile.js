desc("Builds the application");
task("build", {
        async: true
    },
    async function () {
        await exec("tsc");
    });

desc("Clear all tables");
task("clear-db", {
    async: true
}, async function () {
    const $pg = require("./build/pg.js");
    const $pgStrm = require("pg-copy-streams");

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
        truncate table computers cascade;
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

async function exec(cmd) {
    return new Promise((res, rej) => {
        jake.exec(
            cmd,
            () => {
                res();
            }, {
                printStdout: true,
                printStderr: true
            },
        );
    });
}