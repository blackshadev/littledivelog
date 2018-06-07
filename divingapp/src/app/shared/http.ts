import {
    Http,
    XHRBackend,
    RequestOptions,
    RequestOptionsArgs,
    Request,
    Response,
    Headers,
} from '@angular/http';
import { Observable, from } from 'rxjs';
import { AuthService } from 'app/services/auth.service';
import { Injectable } from '@angular/core';
import { catchError, flatMap } from 'rxjs/operators';

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
        let headers: Headers;
        if (url instanceof Request) {
            headers = url.headers;
        } else if (options) {
            headers = options.headers;
        }
        this.auth.setAccessHeaders(headers);
    }

    public request(
        url: string | Request,
        options?: RequestOptionsArgs,
    ): Observable<Response> {
        this.setHeaders(url, options);
        return super.request(url, options).pipe(
            catchError<Response, Response>(err => {
                if (err.status === 401) {
                    return from(
                        this.auth.fetchAccessToken().catch((_err: Error) => {
                            this.auth.resetSessions();
                        }),
                    ).pipe(
                        flatMap(() => {
                            this.setHeaders(url, options);
                            return super.request(url, options);
                        }),
                    );
                } else {
                    return Observable.throw(err);
                }
            }),
        );
    }
}
