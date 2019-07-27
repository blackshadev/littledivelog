import * as pmx from "@pm2/io";

try {
    pmx.init({
        metrics: {
            http: true, // (default: true) HTTP routes logging
            v8: true,
            eventLoop: true,
            network: true,
        },
    });
} catch (err) {
    console.error("PMX init failed", err);
    /** Ignore */
}

import { triggerAsyncId } from "async_hooks";
import * as server from "./startServer";
server.start();
