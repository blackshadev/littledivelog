import { createReadStream } from "fs";
import * as request from "request";

const base = "http://localhost:3000";
const sess = "464debe8-8620-4cbb-8eb0-3c2656521ac9";

console.log(process.argv[2]);
const strm = createReadStream(process.argv[2]);
const req = request.post(
    `${base}/${sess}/import`,
    {
        headers: {
            "Content-Type": "application/json",
        },
    },
    (_, __, body) => {
        console.log(body);
    },
);

strm.pipe(req);
