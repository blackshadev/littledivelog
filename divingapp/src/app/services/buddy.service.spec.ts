import { TestBed, inject } from '@angular/core/testing';
import { BuddyService } from './buddy.service';
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
            expect(list).toEqual(testData);
        });
    });
});
