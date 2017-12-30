import * as archiver from "archiver";
import * as express from "express";
import * as path from "path";
import * as xmlEscape from "xml-escape";

export const router  = express.Router();

const uploaderDir = __dirname + "../../../dive-uploader/";
function generateUploaderConfig(token: string|null): string {
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

router.get("/download", (req, res) => {

    res.attachment("dive-uploader.zip");
    res.setHeader("Content-Type", "application/zip");

    const archive = archiver("zip", {});

    archive.on("error", (err) => {
        res.status(500).send({error: err.message});
    });

    archive.pipe(res);
    archive.directory(uploaderDir, false);

    let token: string|null = null;
    const authheader: string = req.headers.authorization as string;
    if (authheader) {
        const auth = authheader.split(" ");
        if (auth[0] === "Bearer") {
            token = auth[1];
        }
    }

    archive.append(
        generateUploaderConfig(token),
        { name: "DiveLogUploader.exe.config" },
    );

    archive.finalize();

});
