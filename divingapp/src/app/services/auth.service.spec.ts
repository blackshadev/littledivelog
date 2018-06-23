import { TestBed, inject } from '@angular/core/testing';
import { AuthService } from './auth.service';
import { Http, BaseRequestOptions } from '@angular/http';
import { MockBackend } from '@angular/http/testing';
import {
    HttpClientTestingModule,
    HttpTestingController,
} from '@angular/common/http/testing';
import { serviceUrl } from '../shared/config';

fdescribe('AuthService', () => {
    let service: AuthService;
    let httpMock: HttpTestingController;
    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [HttpClientTestingModule],
            providers: [Http, AuthService],
        });

        service = TestBed.get(AuthService);
        httpMock = TestBed.get(HttpTestingController);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    // it('Should not be logged in', () => {
    //     expect(service.isLoggedIn).toBe(false);
    // });

    // it('Logged in', async () => {
    //     beforeEach(async () => {
    //         await service.login('dive@littledev.nl', 'superSecret');
    //         const req = httpMock.expectOne(`${serviceUrl}/auth/refresh-token`);
    //         expect(req.request.method).toEqual('POST');
    //         req.flush({ jwt: 'myJWT' });
    //     });

    //     it('Should be isLoggedIn', async () => {
    //         expect(service.isLoggedIn).toBe(true);
    //     });
    // });
});
