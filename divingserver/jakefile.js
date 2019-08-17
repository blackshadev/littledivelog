$pg = require("./build/pg.js");
desc("Reset dives");
task("reset-dives", { async: true }, async function() {
    const targetDb = new $pg.DbAdapter();
    const srcDb = new $pg.DbAdapter();
    targetDb.setConfig(require("./config.json").database);
    await targetDb.start();

    const res = await $pg.database.call("SELECT * FROM dives");
    console.log(res);

    await targetDb.stop();
    this.complete();
});
