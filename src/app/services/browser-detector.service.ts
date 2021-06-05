import { Injectable, PLATFORM_ID, Inject } from "@angular/core";
import { isPlatformBrowser } from "@angular/common";
import { OS, OS_Rules, detectOS } from "./browser-detector.constants";

export interface DeviceInfo {
    os: OS;
}

@Injectable({
    providedIn: "root",
})
export class BrowserDetectorService {
    private _userAgent: string;

    private _deviceInfo: DeviceInfo;
    public get userAgent(): string {
        return this._userAgent;
    }
    public get os(): OS {
        return this._deviceInfo.os;
    }

    public get isWindows() {
        return this.os === OS.Window;
    }

    public get isLinux() {
        return this.os === OS.Linux;
    }

    constructor(@Inject(PLATFORM_ID) private platformId) {
        if (isPlatformBrowser(platformId)) {
            this.setUserAgent(window.navigator.userAgent);
        }
    }

    public setUserAgent(ua) {
        this._userAgent = ua;
        this._deviceInfo = this.detectDeviceInfo(ua);
    }

    protected detectDeviceInfo(ua: string): DeviceInfo {
        return {
            os: detectOS(ua),
        } as DeviceInfo;
    }
}
