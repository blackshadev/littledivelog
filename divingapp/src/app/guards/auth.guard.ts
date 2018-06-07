import { AuthService } from '../services/auth.service';
import { Injectable } from '@angular/core';
import {
    CanActivate,
    ActivatedRouteSnapshot,
    RouterStateSnapshot,
    Router,
} from '@angular/router';
import { Observable } from 'rxjs';

@Injectable()
export class AuthGuard implements CanActivate {
    constructor(private router: Router, private auth: AuthService) {}

    canActivate(
        next: ActivatedRouteSnapshot,
        state: RouterStateSnapshot,
    ): Observable<boolean> | Promise<boolean> | boolean {
        if (!this.auth.isLoggedIn) {
            // not logged in so redirect to login page with the return url
            this.router.navigate(['/login'], {
                queryParams: { returnUrl: state.url },
            });
            return false;
        } else {
            return true;
        }
    }
}
