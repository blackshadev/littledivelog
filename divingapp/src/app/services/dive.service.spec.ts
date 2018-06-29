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
        let res: Dive[];
        let req: TestRequest;
        beforeEach(done => {
            service
                .list()
                .then(d => {
                    res = d;
                    done();
                })
                .catch(err => done.fail(err));
            req = httpMock.expectOne(`${serviceUrl}/dive/?`);
            req.flush(sampleDives);
        });

        it('Should return parsed dives', () => {
            expect(res).toEqual(Dive.ParseAll(sampleDives));
        });
    });
});
