import { Component, OnInit } from "@angular/core";
import { MiscService } from "app/services/misc.service";
import { BrowserDetectorService } from "app/services/browser-detector.service";
import { OS } from "app/services/browser-detector.constants";

interface Platform {
    OS: OS;
    OSName: string;
    icon: string;
    isActive: boolean;
    url: string;
}

@Component({
    selector: "app-download-uploader",
    templateUrl: "./download-uploader.component.html",
    styleUrls: ["./download-uploader.component.scss"],
})
export class DownloadUploaderComponent {
    public platforms: Platform[];

    constructor(
        public browserService: BrowserDetectorService,
        protected miscService: MiscService,
    ) {
        this.platforms = [
            {
                OS: OS.Linux,
                OSName: "Linux",
                icon: "fa fa-linux",
                isActive: browserService.isLinux,
                url: "https://github.com/blackshadev/electron-dive-downloader/releases/download/v0.0.5/DiveDownloader-0.0.5.AppImage",
            },
            {
                OS: OS.Window,
                OSName: "Windows",
                icon: "fa fa-windows",
                isActive: browserService.isWindows,
                url: "https://github.com/blackshadev/electron-dive-downloader/releases/download/v0.0.5/DiveDownloader-Setup-0.0.5.exe",
            },
        ];

        this.platforms.sort((a, b) => {
            return +b.isActive - +a.isActive;
        });
    }
}
