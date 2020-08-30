import * as archiver from "archiver";
import * as path from "path";
import * as xmlEscape from "xml-escape";
import { Router } from "../express-promise-router";
import { IAuthenticatedRequest } from "../express.interface";
import { createRefreshToken } from "./auth";
import * as fs from "fs";
import * as url from "url";
import { config } from "../config";
import * as semver from "semver";

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

const qtUploaderFolder = path.resolve(
    process.cwd(),
    config.diveUploaderBaseDir,
);
function getFilePath(version: string, os: string): string {
    let fpath = path.resolve(
        qtUploaderFolder,
        version,
        "dive-uploader-installer-" + os,
    );
    if (os === "win32") {
        fpath = fpath + ".exe";
    }
    return fpath;
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

function checkFile(version: string, os: Platform): Promise<boolean> {
    return new Promise<boolean>((res, rej) => {
        const fpath = getFilePath(version, os);

        fs.access(fpath, fs.constants.O_RDONLY, (err) => res(!err));
    });
}

function checkOS(os: string): os is Platform {
    return os === "unix" || os === "win32";
}
router.get(
    "/download/:version/:os",
    async (req: IAuthenticatedRequest, res) => {
        const os = req.param("os");
        let ver = req.param("version");

        if (!checkOS(os)) {
            res.status(404).send({
                error:
                    "Unsupported OS. use GET /dive-uploader to get a list of available versions",
            });
            return;
        }

        if (ver === "latest") {
            ver = (await getAvailableVersions())[0].version;
        }

        if (!(await checkVersion(ver))) {
            res.status(404).send({
                error:
                    "No such version. use GET /dive-uploader to get a list of available versions",
            });
            return;
        }

        if (!(await checkFile(ver, os))) {
            res.status(404).send({
                error:
                    "No such OS for this version. use GET /dive-uploader to get a list of available versions",
            });
            return;
        }

        res.setHeader(
            "Access-Control-Expose-Headers",
            "Content-Disposition, Content-Length, Content-Type",
        );

        res.download(getFilePath(ver, os));
    },
);

type Platform = "unix" | "win32";

interface IDownloadLink {
    fileName: string;
    platform: Platform;
    downloadLink: string;
}
type DownloadLinks = {
    [platform in Platform]?: IDownloadLink;
};
interface IUploaderVersion {
    version: string;
    platforms: Platform[];
    downloads: DownloadLinks;
}

function getFilePlatform(f: string): Platform | undefined {
    if (/-win32/.test(f)) {
        return "win32";
    }
    if (/-unix/.test(f)) {
        return "unix";
    }
    return undefined;
}

let cachedVersions: IUploaderVersion[] | undefined;
async function getAvailableVersions(): Promise<IUploaderVersion[]> {
    if (cachedVersions) {
        return cachedVersions;
    }
    let allVersions: IUploaderVersion[] = [];
    const versions = await fs.promises.readdir(qtUploaderFolder);

    for (let ver of versions) {
        let downloads: DownloadLinks = {};
        let platforms: Platform[] = [];
        const files = await fs.promises.readdir(
            path.resolve(qtUploaderFolder, ver),
        );
        for (let f of files) {
            let p = getFilePlatform(f);
            if (downloads[p] || !p) {
                console.warn(`skipping ${f} for platform ${p} `);
                continue;
            }
            let download: IDownloadLink = {
                fileName: f,
                platform: p,
                downloadLink: url.resolve(
                    config.http.base || "/",
                    path.join("/dive-uploader/download/", ver, p),
                ),
            };
            downloads[p] = download;
            platforms.push(p);
        }
        allVersions.push({
            downloads,
            platforms,
            version: ver,
        });
    }
    
    console.log(allVersions);
    allVersions.sort((a, b) =>
        semver.rcompare(semver.parse(a.version), semver.parse(b.version)),
    );

    return allVersions;
}

router.get("/", async (req: IAuthenticatedRequest, res) => {
    res.json(await getAvailableVersions());
});
