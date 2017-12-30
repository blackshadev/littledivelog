import { Injectable } from '@angular/core';
import { AuthService, AuthenticatedService } from 'app/services/auth.service';
import { Http } from '@angular/http';
import { serviceUrl } from 'app/shared/config';

@Injectable()
export class MiscService extends AuthenticatedService {

    constructor(
        protected http: Http,
        protected auth: AuthService,
    ) {
        super(auth);
    }

    public async getUploader() {
        const res = await this.http.get(
            `${serviceUrl}/dive-uploader/download`,
            this.httpOptions,
        ).toPromise();

        this.downloadFile(res);
    }

}
