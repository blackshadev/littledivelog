import { Injectable } from '@angular/core';
import { AuthService } from 'app/services/auth.service';
import { ResponseContentType, Response } from '@angular/http';
import { serviceUrl } from 'app/shared/config';
import * as FileSaver from 'file-saver';
import { HttpClient } from '@angular/common/http';

@Injectable()
export class MiscService {
    constructor(protected http: HttpClient) {}

    public async getUploader() {
        const res = await this.http
            .get(`${serviceUrl}/dive-uploader/download`, {
                responseType: 'blob',
            })
            .toPromise();

        this.downloadFile(res);
    }

    protected downloadFile(blob: Blob) {
        console.log(blob);
        // const blob = new Blob([res.blob()], { type: 'application/zip' });
        FileSaver.saveAs(blob, 'dive-uploader.zip');
    }
}
