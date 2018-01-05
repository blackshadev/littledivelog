import { Http, XHRBackend, RequestOptions, RequestOptionsArgs, Request, Response } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import { AuthService } from 'app/services/auth.service';
import { Injectable } from '@angular/core';

@Injectable()
export class CommonHttp extends Http {

    constructor(
        backend: XHRBackend,
        options: RequestOptions,
        public http: Http,
        public auth: AuthService,
    ) {
        super(backend, options)
    }

    public request(url: string|Request, options?: RequestOptionsArgs): Observable<Response> {
        return super.request(url, options)
            .catch((err) => {
                if (err.status === 401) {
                    this.auth.logout();
                } else {
                    return Observable.throw(err)
                }
            });
    }

}
