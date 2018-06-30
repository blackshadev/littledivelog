import { TestBed, inject } from '@angular/core/testing';
import { DiveService, IComputer } from './dive.service';
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

    it('Get dive should parse dive', done => {
        service
            .get(2)
            .then(d => {
                expect(d).toEqual(Dive.Parse(sampleDives[2]));
                done();
            })
            .catch(done.fail);

        const req = httpMock.expectOne({
            url: `${serviceUrl}/dive/2`,
            method: 'GET',
        });
        req.flush(sampleDives[2]);
    });

    it('Get dive on error', done => {
        service
            .get(2)
            .then(d => {
                done.fail('Expected error');
            })
            .catch(done);

        const req = httpMock.expectOne({
            url: `${serviceUrl}/dive/2`,
            method: 'GET',
        });
        req.error(new ErrorEvent('errr'), {
            status: 400,
        });
    });

    it('Get samples', done => {
        const samples = require('./divesamples.json');

        service
            .samples(2)
            .then(d => {
                expect(d).toBe(samples);
                done();
            })
            .catch(done.fail);

        const req = httpMock.expectOne({
            url: `${serviceUrl}/dive/2/samples`,
            method: 'GET',
        });
        req.flush(samples);
    });

    it('Get samples', done => {
        service
            .samples()
            .then(d => {
                expect(d).toEqual([]);
                done();
            })
            .catch(done.fail);

        httpMock.expectNone({
            url: `${serviceUrl}/dive/2/samples`,
            method: 'GET',
        });
    });

    it('listComputers', done => {
        const comp: IComputer[] = [
            {
                computer_id: 1,
                dive_count: 2,
                name: 'Test Comp',
                last_read: new Date('2018-02-03T15:15:33'),
                vendor: 'Test',
            },
        ];
        service
            .listComputers()
            .then(d => {
                expect(d).toBe(comp);
                done();
            })
            .catch(done.fail);

        const req = httpMock.expectOne({
            url: `${serviceUrl}/computer`,
            method: 'GET',
        });
        req.flush(comp);
    });

    it('Delete', done => {
        const value = true;
        service
            .delete(3)
            .then(d => {
                expect(d as any).toEqual(JSON.stringify(value));
                done();
            })
            .catch(done.fail);

        const req = httpMock.expectOne({
            url: `${serviceUrl}/dive/3`,
            method: 'DELETE',
        });
        req.flush(JSON.stringify(value));
    });

    describe('Save', () => {
        it('Insert');
        it('Update');
        it('Should clear buddy cache with new buddies');
        it('Should clear tags cache with new tags');
    });
});
