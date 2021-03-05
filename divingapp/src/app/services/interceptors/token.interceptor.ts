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
import { endpointFromRequest, hasEndpoint, IEndpoint } from 'app/shared/serviceUrlHelpers';

let iX = 0;
@Injectable()
export class TokenInterceptor implements HttpInterceptor {

    private static publicEndpoints: IEndpoint[] = [
        { method: 'POST', path: '/auth/register' },
        { method: 'POST', path: '/auth/sessions' }
    ];
    private static refreshTokenEndpoints: IEndpoint[] = [
        { method: 'GET', path: '/auth/sessions/refresh' },
        { method: 'DELETE', path: '/auth/sessions' }
    ];

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
        const endpoint = endpointFromRequest(request);
        return !this.isPublicEndpoint(endpoint) && !this.isRefreshEndpoint(endpoint);
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

    private isPublicEndpoint(endpoint: IEndpoint): boolean {
        return hasEndpoint(endpoint, TokenInterceptor.publicEndpoints);
    }

    private isRefreshEndpoint(endpoint: IEndpoint): boolean {
        return hasEndpoint(endpoint, TokenInterceptor.refreshTokenEndpoints);
    }
}
