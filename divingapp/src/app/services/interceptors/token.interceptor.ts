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

@Injectable()
export class TokenInterceptor implements HttpInterceptor {
    constructor(public auth: AuthService) {}

    intercept(
        request: HttpRequest<any>,
        next: HttpHandler,
    ): Observable<HttpEvent<any>> {
        if (request.url.indexOf('auth/refresh-token') > -1) {
            return next.handle(request);
        }

        if (!this.auth.accessToken) {
            return from(this.auth.fetchAccessToken()).pipe(
                this.intercept(request, next),
            );
        }

        if (
            !request.headers.has('x-no-token') &&
            !request.headers.has('Authorization')
        ) {
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
