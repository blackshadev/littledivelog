import * as archiver from "archiver";
import * as express from "express";
import * as path from "path";
import * as xmlEscape from "xml-escape";
import { Router } from "../express-promise-router";
import { database } from "../pg";
import { createRefreshToken } from "./auth";

export const router = Router();

const uploaderDir = __dirname + "../../../dive-uploader/";
function generateUploaderConfig(token: string | null): string {
    const jsonObject = {
        Serial: null,
        Computer: null,
        Destination: null,
        Target: token !== null ? "DiveLog" : "File",
        AppToken: token,
    };
    const jsonStr = xmlEscape(JSON.stringify(jsonObject));

    return `<?xml version="1.0" encoding="utf-8" ?>
<configuration>
    <startup>
    <supportedRuntime version="v4.0" sku=".NETFramework,Version=v4.5.2" />
    </startup>
    <appSettings>
    <add key="last_session" value="${jsonStr}" />
    </appSettings>
</configuration>`;
}

router.get("/download", async (req, res) => {
    res.attachment("dive-uploader.zip");
    res.setHeader("Content-Type", "application/zip");

    const archive = archiver("zip", {});

    archive.on("error", err => {
        res.status(500).send({ error: (err.message || err.toString()) });
    });

    archive.pipe(res);
    archive.directory(uploaderDir, false);

    let token: string | null = null;
    if (req.user.user_id) {
        token = await createRefreshToken(
            req.user.user_id,
            req.ip,
            "DiveUploader tool",
        );
    }

    archive.append(generateUploaderConfig(token), {
        name: "DiveLogUploader.exe.config",
    });

    archive.finalize();
});
