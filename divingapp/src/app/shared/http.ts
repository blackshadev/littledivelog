import {
    Http,
    XHRBackend,
    RequestOptions,
    RequestOptionsArgs,
    Request,
    Response,
    Headers,
} from '@angular/http';
import { Observable } from 'rxjs/Observable';
import { AuthService } from 'app/services/auth.service';
import { Injectable } from '@angular/core';

@Injectable()
export class ResourceHttp extends Http {
    constructor(
        backend: XHRBackend,
        options: RequestOptions,
        public http: Http,
        public auth: AuthService,
    ) {
        super(backend, options);
    }

    public setHeaders(
        url: string | Request,
        options?: RequestOptionsArgs,
    ): void {
        if (url instanceof Request) {
            url.headers.set('Authorization', 'Bearer ' + this.auth.accessToken);
        } else if (options) {
            options.headers = options.headers || new Headers();
            options.headers.set(
                'Authorization',
                'Bearer ' + this.auth.accessToken,
            );
        }
    }

    public request(
        url: string | Request,
        options?: RequestOptionsArgs,
    ): Observable<Response> {
        this.setHeaders(url, options);
        return super.request(url, options).catch<Response, Response>(err => {
            if (err.status === 401) {
                return Observable.from(
                    this.auth.fetchAccessToken().catch((_err: Error) => {
                        this.auth.logout();
                        throw new Error(
                            'Error while fetching access token ' + _err.message,
                        );
                    }),
                ).flatMap(() => {
                    this.setHeaders(url, options);
                    return super.request(url, options);
                });
            } else {
                return Observable.throw(err);
            }
        });
    }
}
