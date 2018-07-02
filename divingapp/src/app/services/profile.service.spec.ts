import { TestBed, inject } from '@angular/core/testing';

import {
    ProfileService,
    IProfile,
    IEquipment,
    ISession,
} from './profile.service';
import {
    HttpClientTestingModule,
    HttpTestingController,
} from '@angular/common/http/testing';
import { HttpClient } from '@angular/common/http';
import { serviceUrl } from '../shared/config';

describe('ProfileService', () => {
    let service: ProfileService;
    let httpMock: HttpTestingController;
    const profileSample: IProfile = {
        name: 'Vincent Hagen',
        email: 'dive@littledev.nl',
        inserted: new Date('2018-05-31 07:19:17.655733'),
        dive_count: 5,
        computer_count: 1,
        buddy_count: 1,
        tag_count: 2,
    };

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [HttpClientTestingModule],
            providers: [HttpClient, ProfileService],
        });

        service = TestBed.get(ProfileService);
        httpMock = TestBed.get(HttpTestingController);
    });

    it('Should be created', inject([ProfileService], (s: ProfileService) => {
        expect(s).toBeTruthy();
        expect(service).toBe(s);
    }));

    it('profile.get should get user profile with request', done => {
        service
            .get()
            .then(d => {
                expect(d).toBe(
                    profileSample,
                    'Expected request data to be the same as return data',
                );
                done();
            })
            .catch(done.fail);

        const req = httpMock.expectOne({
            url: `${serviceUrl}/user/profile`,
            method: 'GET',
        });
        req.flush(profileSample);
    });

    it('profile.save should put name in user/profile ', done => {
        const sampleData = { name: 'tester' };
        service
            .save(sampleData)
            .then(done)
            .catch(done.fail);

        const req = httpMock.expectOne({
            url: `${serviceUrl}/user/profile`,
            method: 'PUT',
        });
        expect(req.request.body).toEqual(sampleData);
        req.flush('');
    });

    it('profile.changePassword should put request user/profile/password', done => {
        const sampleData = { old: 'passwd', new: 'myNewPasswd' };

        service
            .changePassword(sampleData)
            .then(done)
            .catch(done.fail);

        const req = httpMock.expectOne({
            url: `${serviceUrl}/user/profile/password`,
            method: 'PUT',
        });
        expect(req.request.body).toEqual(sampleData);
        req.flush(sampleData);
    });

    it('profile.equipment should get user/profile/equipment', done => {
        const sampleData: IEquipment = {
            tanks: [
                {
                    volume: 10,
                    oxygen: 21,
                    pressure: { begin: 200, end: 50, type: 'bar' },
                },
            ],
        };

        service
            .equipment()
            .then(d => {
                expect(d).toBe(
                    sampleData,
                    'Expected request data to be the same as return data',
                );
                done();
            })
            .catch(done.fail);

        const req = httpMock.expectOne({
            url: `${serviceUrl}/user/profile/equipment`,
            method: 'GET',
        });
        req.flush(sampleData);
    });

    it('profile.equipment should put user/profile/equipment', done => {
        const sampleData: IEquipment = {
            tanks: [
                {
                    volume: 10,
                    oxygen: 21,
                    pressure: { begin: 200, end: 50, type: 'bar' },
                },
            ],
        };

        service
            .changeEquipment(sampleData)
            .then(done)
            .catch(done.fail);

        const req = httpMock.expectOne({
            url: `${serviceUrl}/user/profile/equipment`,
            method: 'PUT',
        });
        expect(req.request.body).toEqual(sampleData);
        req.flush('');
    });

    it('profile.getSessions should get requests', done => {
        const sampleData: ISession[] = [
            {
                token: '89a6cae7-1a61-47a4-a35c-207b4b083f87',
                user_id: 1,
                last_used: new Date('2018-07-02 20:12:55.616628'),
                last_ip: '77.164.218.222',
                description: 'dive.littledev.nl User Login',
                insert_ip: '77.164.218.222',
                inserted: new Date('2018-07-01 08:39:22.080271'),
            },
        ];
        service
            .getSessions()
            .then(d => {
                expect(d).toBe(
                    sampleData,
                    'Expected request data to be the same as return data',
                );
                done();
            })
            .catch(done.fail);

        const req = httpMock.expectOne({
            url: `${serviceUrl}/auth/refresh-token`,
            method: 'GET',
        });
        req.flush(sampleData);
    });

    it('profile.deleteSession should call delete on given token', done => {
        const sampleToken = 'TOKEN';
        service
            .deleteSession(sampleToken)
            .then(done)
            .catch(done.fail);

        const req = httpMock.expectOne({
            url: `${serviceUrl}/auth/refresh-token/${sampleToken}`,
        });
        req.flush('');
    });
});
