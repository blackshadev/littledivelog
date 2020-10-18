import { AuthService } from '../auth.service';
import {
    HttpInterceptor,
    HttpRequest,
    HttpHandler,
    HttpEvent,
    HttpErrorResponse,
} from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, from, throwError } from 'rxjs';
import 'rxjs/add/operator/catch';
import 'rxjs/add/operator/switchMap';
import { switchMap } from 'rxjs/operators/switchMap';
import { serviceUrl } from '../../shared/config';
import 'rxjs/add/observable/throw';

let iX = 0;
@Injectable()
export class TokenInterceptor implements HttpInterceptor {
    constructor(public auth: AuthService) { }

    public intercept(
        request: HttpRequest<any>,
        next: HttpHandler,
    ): Observable<HttpEvent<any>> {
        if (!this.shouldIntercept(request)) {
            return next.handle(request);
        }

        request = request.clone({
            setHeaders: {
                Authorization: `Bearer ${this.auth.accessToken}`,
            },
        });

        return next.handle(request).catch((err) => {
            if (err instanceof HttpErrorResponse && err.status === 401) {
                return this.fetchAccessToken(request.clone(), next);
            } else {
                return throwError(err);
            }
        });

    }

    public shouldIntercept(request: HttpRequest<any>): boolean {
        let shouldIntercept = request.url.indexOf(serviceUrl) > -1 &&
            request.url.indexOf('/auth/sessions') === -1 &&
            request.url.indexOf('/auth/register') === -1;

        return shouldIntercept;
    }

    public fetchAccessToken(request: HttpRequest<any>, next: HttpHandler) {
        return from(this.auth.fetchAccessToken())
            .catch(() => {
                return from(this.auth.logout());
            })
            .pipe(
                switchMap(() => {
                    return this.intercept(request, next);
                }),
            );
    }
}
