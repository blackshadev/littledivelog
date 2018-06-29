import { TestBed, inject } from '@angular/core/testing';
import { BuddyService, IBuddyStat } from './buddy.service';
import { Http } from '@angular/http';
import {
    HttpClientTestingModule,
    HttpTestingController,
    TestRequest,
} from '@angular/common/http/testing';
import { IBuddy } from '../shared/dive';
import { serviceUrl } from '../shared/config';

fdescribe('BuddyService', () => {
    let service: BuddyService;
    let httpMock: HttpTestingController;
    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [HttpClientTestingModule],
            providers: [Http, BuddyService],
        });

        service = TestBed.get(BuddyService);
        httpMock = TestBed.get(HttpTestingController);
    });

    it('should be created', inject([BuddyService], (b: BuddyService) => {
        expect(b).toBeTruthy();
        expect(b).toEqual(service);
    }));

    describe('List', () => {
        const testData: IBuddy[] = [
            {
                buddy_id: 0,
                color: '#fff',
                email: 'tester@test.com',
                text: 'tester test',
            },
            {
                buddy_id: 1,
                color: '#fff',
                email: 'teste01r@test.com',
                text: 'tester01 test',
            },
        ] as IBuddy[];
        let list: IBuddy[];
        let req: TestRequest;

        beforeEach(done => {
            service
                .list()
                .then(d => {
                    list = d;
                    done();
                })
                .catch(done);

            req = httpMock.expectOne(`${serviceUrl}/buddy/`);
            req.flush(testData);
        });

        it('Should be GET request', () => {
            expect(req.request.method).toEqual('GET');
        });

        it('Should have valid output', () => {
            expect(list).toBe(testData);
        });

        it('Should use cache with in later requests', async done => {
            service
                .list()
                .then(d => {
                    expect(d).toBe(list);
                    expect(d).toBe(testData);
                    done();
                })
                .catch(done);

            httpMock.expectNone(`${serviceUrl}/buddy/`);
        });

        it('Should request after clear cache', () => {
            const newDat = testData.slice(1);
            service.clearCache();

            service.list().then(d => {
                expect(d).not.toEqual(testData);
                expect(d).toBe(newDat);
            });
            const _req = httpMock.expectOne(`${serviceUrl}/buddy/`);
            expect(_req.request.method).toEqual('GET');
            _req.flush(newDat);
        });
    });

    describe('fullList', () => {
        const testData: IBuddyStat[] = [
            {
                buddy_id: 0,
                color: '#fff',
                email: 'tester@test.com',
                text: 'tester test',
                buddy_user_id: 5,
                dive_count: 10,
                last_dive: new Date('2017-01-01'),
            },
            {
                buddy_id: 1,
                color: '#fff',
                email: 'teste01r@test.com',
                text: 'tester01 test',
                buddy_user_id: 6,
                dive_count: 15,
                last_dive: new Date('2017-06-01'),
            },
        ];
        let list: IBuddy[];
        let req: TestRequest;

        beforeEach(done => {
            service
                .fullList()
                .then(d => {
                    list = d;
                    done();
                })
                .catch(done);

            req = httpMock.expectOne(`${serviceUrl}/buddy/full`);
            req.flush(testData);
        });

        it('Should be GET request', () => {
            expect(req.request.method).toEqual('GET');
        });

        it('Should have valid output', () => {
            expect(list).toBe(testData);
        });
    });
});
