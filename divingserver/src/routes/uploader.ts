import * as archiver from "archiver";
import * as express from "express";
import * as path from "path";
import * as xmlEscape from "xml-escape";
import { Router } from "../express-promise-router";
import { IAuthenticatedRequest } from "../express.interface";
import { database } from "../pg";
import { createRefreshToken } from "./auth";
import * as fs from "fs";
import { filter } from "bluebird";

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

router.get("/download/old", async (req: IAuthenticatedRequest, res) => {
    res.attachment("dive-uploader.zip");
    res.setHeader("Content-Type", "application/zip");

    const archive = archiver("zip", {});

    archive.on("error", (err) => {
        res.status(500).send({ error: err.message || err.toString() });
    });

    archive.pipe(res);
    archive.directory(uploaderDir, false);

    let token: string | null = null;
    if (req.user && req.user.user_id) {
        token = await createRefreshToken(
            req.user.user_id,
            req.ip,
            "DiveUploader tool",
        );
    }

    archive.append(generateUploaderConfig(token), {
        name: "DiveLogUploader.exe.config",
    });

    await archive.finalize();
    res.end();
});

const qtUploaderFolder = __dirname + "../../../qt-dive-uploader";
function getFilePath(version: string, os: string): string {
    return path.resolve(
        qtUploaderFolder,
        version,
        "dive-uploader-installer-" + os,
    );
}
function checkVersion(ver: string): Promise<boolean> {
    return new Promise<boolean>((res, rej) => {
        fs.stat(qtUploaderFolder + "/" + ver, (err, stat) => {
            if (err) {
                return res(false);
            } else {
                res(stat.isDirectory());
            }
        });
    });
}

function checkFile(version: string, os: string): Promise<boolean> {
    return new Promise<boolean>((res, rej) => {
        const fpath = getFilePath(version, os);
        fs.access(fpath, fs.constants.O_RDONLY, (err) => res(!err));
    });
}

router.get(
    "download/{version}/{os}",
    async (req: IAuthenticatedRequest, res) => {
        const os = req.param("os");
        const ver = req.param("version");

        if (!(await checkVersion(ver))) {
            res.status(404).send({
                error:
                    "No such version. use GET /uploader to get a list of available versions",
            });
        }

        if (!(await checkFile(ver, os))) {
            res.status(404).send({
                error:
                    "No such OS for this version. use GET /uploader to get a list of available versions",
            });
        }

        res.download(getFilePath(ver, os));
    },
);

interface IUploaderVersion {
    version: string;
    availableOS: Array<"unix" | "win32">;
}
function readdir(fpath: string): Promise<string[]> {
    return new Promise((res, rej) => {
        fs.readdir(fpath, (err, files) => {
            if (err) {
                rej(err);
            } else {
                res(files);
            }
        });
    });
}

async function getAvailableVersions(): Promise<IUploaderVersion[]> {
    let allVersions: IUploaderVersion[] = [];
    const versions = await readdir(qtUploaderFolder);

    for (let ver of versions) {
        const files = await readdir(path.resolve(qtUploaderFolder, ver));
        const oses = files
            .map((f) => {
                if (f.endsWith("win32.exe")) {
                    return "win32";
                }
                if (f.endsWith("unix")) {
                    return "unix";
                }
                return undefined;
            })
            .filter((v) => !v);

        allVersions.push({
            version: ver,
            availableOS: oses,
        });
    }

    return allVersions;
}

let cached: IUploaderVersion[] | undefined;

router.get("/", async (req: IAuthenticatedRequest, res) => {
    if (!cached) {
        cached = await getAvailableVersions();
    }
    res.json(cached);
});
