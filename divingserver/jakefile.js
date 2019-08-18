$pg = require("./build/pg.js");
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


desc("Clear all tables")
task("clear-db" { async: true }, async function() {
    const targetDb = new $pg.DbAdapter();
    targetDb.setConfig(require("./config.json").database);
    await targetDb.start();

    const res = await $pg.database.call(`
        truncate table dives cascade;
        truncate table buddies cascade;
        truncate table tags cascade;
        truncate table places cascade;
    `);

    this.complete();
});