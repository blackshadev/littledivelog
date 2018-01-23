import * as pmx from "pmx";

try {
    pmx.init({
        http: true, // (default: true) HTTP routes logging
        custom_probes: true, // (default: true) Auto expose JS Loop Latency and HTTP req/s as custom metrics
        network: true, // (default: false) Network monitoring at the application level
        ports: true, // (default: false) Shows which ports your app is listening on
        transactions: true, // (default: false) Enable transaction tracing
        ignoreFilter: {
            url: [],
            method: ["OPTIONS", "HEAD"],
        },
        // can be 'express', 'hapi', 'http', 'restify'
        excludedHooks: [],
    });
} catch (err) {
    console.error("PMX init failed", err);
    /** Ignore */
}

import * as server from "./startServer";
server.start();
