import { AuthService } from '../auth.service';
import {
    HttpInterceptor,
    HttpRequest,
    HttpHandler,
    HttpEvent,
} from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable()
export class TokenInterceptor implements HttpInterceptor {
    constructor(public auth: AuthService) {}

    intercept(
        request: HttpRequest<any>,
        next: HttpHandler,
    ): Observable<HttpEvent<any>> {
        request = request.clone();

        if (
            !request.headers.has('x-no-token') &&
            !request.headers.has('Authorization')
        ) {
            request = request.clone({
                setHeaders: {
                    Authorization: `Bearer ${this.auth.accessToken}`,
                },
            });
        } else {
            request.headers.delete('x-no-token');
        }

        return next.handle(request);
    }
}
