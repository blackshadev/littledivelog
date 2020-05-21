import { Injectable } from '@angular/core';
import { AuthService } from 'app/services/auth.service';
import { ResponseContentType, Response } from '@angular/http';
import { serviceUrl } from 'app/shared/config';
import * as FileSaver from 'file-saver';
import { HttpClient } from '@angular/common/http';

@Injectable()
export class MiscService {
    constructor(protected http: HttpClient) {}

    public async getUploader(os: string) {
        const res = await this.http
            .get(`${serviceUrl}/dive-uploader/download/latest/${os}`, {
                responseType: 'blob',
            })
            .toPromise();
        console.log(res);

        this.downloadFile(res);
    }

    protected downloadFile(blob: Blob) {
        FileSaver.saveAs(blob, 'dive-uploader.zip');
    }
}
