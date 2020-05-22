import { Injectable, PLATFORM_ID, Inject } from '@angular/core';

export enum OS {
    Window = 'windows',
    Linux = 'linux',
    Unix = 'unix',
    MacOS = 'macos',
}

@Injectable({
    providedIn: 'root',
})
export class BrowserDetectorService {
    public readonly userAgent: string;
    public readonly os: OS;

    public get isWindows() {
        return this.os === OS.Window;
    }

    public get isLinux() {
        return this.os === OS.Linux;
    }

    constructor(@Inject(PLATFORM_ID) private platformId) {
        this.userAgent = window.navigator.userAgent;
        this.os = this.detectOS();
    }

    protected detectOS(): OS {
        if (navigator.appVersion.indexOf('Win') !== -1) {
            return OS.Window;
        }
        if (navigator.appVersion.indexOf('Mac') !== -1) {
            return OS.MacOS;
        }
        if (navigator.appVersion.indexOf('Linux') !== -1) {
            return OS.Linux;
        }
        if (navigator.appVersion.indexOf('X11') !== -1) {
            return OS.Unix;
        }
    }
}
