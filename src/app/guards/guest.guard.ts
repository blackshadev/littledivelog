import { Injectable } from '@angular/core';
import {
    CanActivate,
    ActivatedRouteSnapshot,
    RouterStateSnapshot,
    Router,
} from '@angular/router';
import { Observable } from 'rxjs';
import { AuthService } from 'app/services/auth.service';

@Injectable()
export class GuestGuard implements CanActivate {
    constructor(private router: Router, private auth: AuthService) {}

    canActivate(
        next: ActivatedRouteSnapshot,
        state: RouterStateSnapshot,
    ): Observable<boolean> | Promise<boolean> | boolean {
        if (this.auth.isLoggedIn) {
            // not logged in so redirect to login page with the return url
            this.router.navigate(['/dashboard'], {});
            return false;
        } else {
            return true;
        }
    }
}
