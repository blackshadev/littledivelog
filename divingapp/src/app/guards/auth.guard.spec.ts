import { TestBed, async, inject } from '@angular/core/testing';
import { Router, GuardsCheckEnd, RouterStateSnapshot } from '@angular/router';
import { AuthGuard } from './auth.guard';
import { AuthService } from '../services/auth.service';

fdescribe('AuthGuard', () => {
    let authGuard: AuthGuard;
    let authService = {
        isLoggedIn: false,
    };
    const router = {
        navigate: jasmine.createSpy('navigate'),
    };
    let mockSnapshot: RouterStateSnapshot;

    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [
                AuthGuard,
                { provide: AuthService, useValue: authService },
                { provide: Router, useValue: router },
            ],
        });
        mockSnapshot = jasmine.createSpyObj<RouterStateSnapshot>(
            'RouterStateSnapshot',
            ['toString'],
        );

        mockSnapshot.url = '/protected/url';

        authGuard = TestBed.get(AuthGuard);
        authService = TestBed.get(AuthService);
        router.navigate.calls.reset();
    });

    it('Should be created', inject([AuthGuard], (guard: AuthGuard) => {
        expect(guard).toBeTruthy();
    }));

    it('Should not be able to access route while not logged in', () => {
        authService.isLoggedIn = false;

        expect(authGuard.canActivate(null, mockSnapshot)).toBe(false);
        expect(router.navigate).toHaveBeenCalledWith(['/login'], {
            queryParams: {
                returnUrl: '/protected/url',
            },
        });
    });

    it('Should be able to access route while not logged in', () => {
        authService.isLoggedIn = true;
        expect(authGuard.canActivate(null, mockSnapshot)).toBe(true);
        expect(router.navigate).not.toHaveBeenCalled();
    });
});
