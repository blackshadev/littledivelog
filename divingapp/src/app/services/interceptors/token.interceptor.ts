import { AuthService } from '../auth.service';
import {
    HttpInterceptor,
    HttpRequest,
    HttpHandler,
    HttpEvent,
    HttpErrorResponse,
} from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, from } from 'rxjs';
import 'rxjs/add/operator/catch';
import 'rxjs/add/operator/switchMap';
import { switchMap } from 'rxjs/operators/switchMap';
import { catchError } from 'rxjs/operators/catchError';
import { serviceUrl } from '../../shared/config';

@Injectable()
export class TokenInterceptor implements HttpInterceptor {
    constructor(public auth: AuthService) {}

    intercept(
        request: HttpRequest<any>,
        next: HttpHandler,
    ): Observable<HttpEvent<any>> {
        if (
            request.url.indexOf(serviceUrl) === -1 ||
            request.url.indexOf('auth/refresh-token') > -1
        ) {
            return next.handle(request);
        }

        if (!request.headers.has('Authorization')) {
            if (!this.auth.accessToken) {
                return from(this.auth.fetchAccessToken()).pipe(
                    switchMap(() => {
                        return this.intercept(request.clone(), next);
                    }),
                    catchError(err => {
                        console.error(
                            'Failed to get access token ' + err.toString(),
                        );
                        return Observable.throw(err);
                    }),
                );
            }

            console.log('Token');
            request = request.clone({
                setHeaders: {
                    Authorization: `Bearer ${this.auth.accessToken}`,
                },
            });
            console.log(request.headers);
        } else {
            request = request.clone();
            request.headers.delete('x-no-token');
        }

        return next.handle(request);
    }
}
