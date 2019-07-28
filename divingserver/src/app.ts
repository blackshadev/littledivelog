import * as pmx from "@pm2/io";
const maxListenersExceededWarning = require("max-listeners-exceeded-warning");

maxListenersExceededWarning();

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
