import { Injectable } from '@angular/core';
import { serviceUrl } from 'app/shared/config';
import * as FileSaver from 'file-saver';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { flatMap } from 'rxjs/operators';
import { OS } from './browser-detector.constants';

function urlExtension(os: OS) {
    switch (os) {
        case OS.Window:
            return 'win32';
        case OS.Unix:
        case OS.Linux:
            return 'unix';
    }
}

@Injectable()
export class MiscService {
    private static getFilename(s: string): string | undefined {
        const re = /filename="([^"]+)"/.exec(s);
        return re?.[1];
    }

    constructor(protected http: HttpClient) {}

    public getUploaderUrl(os: OS): string {
        return  `${serviceUrl}/uploader/latest/${urlExtension(os)}`;
    }
}
