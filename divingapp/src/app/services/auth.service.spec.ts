import { TestBed, inject } from '@angular/core/testing';
import { AuthService } from './auth.service';
import { Http } from '@angular/http';
import {
    HttpClientTestingModule,
    HttpTestingController,
    TestRequest,
} from '@angular/common/http/testing';
import { serviceUrl } from '../shared/config';

describe('AuthService', () => {
    let service: AuthService & { reloadWindow: () => void };
    let httpMock: HttpTestingController;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [HttpClientTestingModule],
            providers: [Http, AuthService],
        });

        service = TestBed.get(AuthService);
        httpMock = TestBed.get(HttpTestingController);
        service.reloadWindow = () => {};
    });

    beforeEach(() => {
        service.resetSessions();
    });

    it('should be created', inject([AuthService], (s: AuthService) => {
        expect(s).toBeTruthy();
        expect(s).toEqual(service);
    }));

    it('Should not be logged in', () => {
        expect(service.isLoggedIn).toBe(false);
    });

    describe('Logged in', () => {
        const accessToken = 'myAccessToken';
        const refreshToken = 'myRefreshToken';

        beforeEach(done => {
            service
                .login('dive@littledev.nl', 'superSecret')
                .then(() => done());
            const req = httpMock.expectOne({
                url: `${serviceUrl}/auth/refresh-token`,
                method: 'POST',
            });
            req.flush({ jwt: refreshToken });
        });

        it('Should be isLoggedIn', () => {
            expect(service.isLoggedIn).toBe(true);
        });

        it('Empty access token', () => {
            expect(service.accessToken).toBeNull();
        });

        describe('Logout', () => {
            let req: TestRequest;
            beforeEach(done => {
                spyOn(service, 'reloadWindow');
                service.logout().then(done);

                req = httpMock.expectOne({
                    url: `${serviceUrl}/auth/refresh-token`,
                    method: 'DELETE',
                });
                req.flush('true');
            });

            it('Delete request should contain refresh token', () => {
                expect(req.request.headers.get('Authorization')).toEqual(
                    'Bearer ' + refreshToken,
                );
            });

            it('Should have reloadedWindow', () => {
                expect(service.reloadWindow).toHaveBeenCalled();
            });

            it('Should not be loggedin', () => {
                expect(service.isLoggedIn).toEqual(false);
            });

            it('Should empty access token', () => {
                expect(service.accessToken).toBeNull();
            });
        });

        describe('Access token', () => {
            let accessReq: TestRequest;

            beforeEach(done => {
                service.fetchAccessToken().then(() => done());
                accessReq = httpMock.expectOne({
                    url: `${serviceUrl}/auth/access-token`,
                    method: 'GET',
                });
                accessReq.flush({ jwt: accessToken });
            });

            it('Should set refresh token in request', () => {
                expect(accessReq.request.headers.get('Authorization')).toEqual(
                    'Bearer ' + refreshToken,
                );
            });

            it('Should have access token', () => {
                expect(service.accessToken).toEqual(accessToken);
            });

            it('Should have authorization header', () => {
                expect(service.accessHeader).toEqual({
                    Authorization: 'Bearer ' + accessToken,
                });
            });
        });
    });
});
