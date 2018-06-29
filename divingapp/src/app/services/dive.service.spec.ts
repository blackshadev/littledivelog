import { TestBed, inject } from '@angular/core/testing';
import { DiveService } from './dive.service';
import {
    HttpClientTestingModule,
    HttpTestingController,
    TestRequest,
} from '@angular/common/http/testing';
import { HttpClient } from '@angular/common/http';
import { BuddyService } from './buddy.service';
import { TagService } from './tag.service';
import { IDbDive, Dive } from '../shared/dive';
import { serviceUrl } from '../shared/config';
import { sample } from 'rxjs/operators';

const sampleDives: IDbDive[] = require('./dive.samples.json');

fdescribe('DiveService', () => {
    let service: DiveService;
    let httpMock: HttpTestingController;
    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [HttpClientTestingModule],
            providers: [HttpClient, TagService, BuddyService, DiveService],
        });

        service = TestBed.get(DiveService);
        httpMock = TestBed.get(HttpTestingController);
    });

    it('Should be created', inject([DiveService], (ser: DiveService) => {
        expect(ser).toBeTruthy();
        expect(ser).toBe(service);
    }));

    describe('List', () => {
        it('Should parse dives', done => {
            service
                .list()
                .then(res => {
                    expect(res).toEqual(Dive.ParseAll(sampleDives));

                    done();
                })
                .catch(done.fail);
            const req = httpMock.expectOne({
                url: `${serviceUrl}/dive/?`,
                method: 'GET',
            });
            req.flush(sampleDives);
        });

        it('Should apply filters in query string', done => {
            service
                .list({
                    buddies: '1,5',
                    country: 'NL',
                })
                .then(res => {
                    expect(res).toEqual(Dive.ParseAll(sampleDives));

                    done();
                })
                .catch(done.fail);
            const req = httpMock.expectOne(r => {
                expect(r.method).toEqual('GET');

                expect(r.url).toContain(`${serviceUrl}/dive/`);
                expect(r.url).toContain(`buddies=${encodeURIComponent(`1,5`)}`);
                expect(r.url).toContain(`country=NL`);

                return true;
            });
            req.flush(sampleDives);
        });
    });
});
