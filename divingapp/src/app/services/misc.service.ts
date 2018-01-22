import { Injectable } from '@angular/core';
import { AuthService, AuthenticatedService } from 'app/services/auth.service';
import { ResponseContentType, Response } from '@angular/http';
import { serviceUrl } from 'app/shared/config';
import { ResourceHttp } from 'app/shared/http';
import * as FileSaver from 'file-saver';

@Injectable()
export class MiscService extends AuthenticatedService {
    constructor(protected http: ResourceHttp, protected auth: AuthService) {
        super(http);
    }

    public async getUploader() {
        const res = await this.http
            .get(`${serviceUrl}/dive-uploader/download`, {
                responseType: ResponseContentType.Blob,
            })
            .toPromise();

        this.downloadFile(res);
    }

    protected downloadFile(res: Response) {
        const blob = new Blob([res.blob()], { type: 'application/zip' });
        FileSaver.saveAs(blob, 'dive-uploader.zip');
    }
}
