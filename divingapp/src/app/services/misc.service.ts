import { Injectable } from '@angular/core';
import { serviceUrl } from 'app/shared/config';
import * as FileSaver from 'file-saver';
import { HttpClient } from '@angular/common/http';
import { OS } from './browser-detector.service';
import { Observable } from 'rxjs';
import { flatMap } from 'rxjs/operators';

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

    public getUploader(os: OS): Observable<string> {
        return this.http
            .get(
                `${serviceUrl}/dive-uploader/download/latest/${urlExtension(
                    os,
                )}`,
                {
                    observe: 'response',
                    responseType: 'blob',
                },
            )
            .pipe(
                flatMap((res) => {
                    const fileName = MiscService.getFilename(
                        res.headers.get('Content-Disposition'),
                    );
                    this.downloadFile(res.body, fileName);
                    return fileName;
                }),
            );
    }

    protected downloadFile(blob: Blob, fileName: string) {
        FileSaver.saveAs(blob, fileName);
    }
}
