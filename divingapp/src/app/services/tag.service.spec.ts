import { TestBed, inject } from '@angular/core/testing';
import { TagService, ITagStat } from './tag.service';
import {
    HttpClientTestingModule,
    HttpTestingController,
} from '@angular/common/http/testing';
import { HttpClient } from '@angular/common/http';
import { serviceUrl } from '../shared/config';
import { ITag } from '../components/controls/tags/tags.component';

describe('TagService', () => {
    let service: TagService;
    let httpMock: HttpTestingController;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [HttpClientTestingModule],
            providers: [HttpClient, TagService],
        });
        service = TestBed.get(TagService);
        httpMock = TestBed.get(HttpTestingController);
    });

    it('Should be created', inject([TagService], (s: TagService) => {
        expect(s).toBeTruthy();
        expect(s).toBe(service);
    }));

    it('List should request get tag', done => {
        const sampleData: ITag[] = [
            { tag_id: 1, text: 'Test', color: '#9914ff' },
            { tag_id: 2, text: 'Test2', color: '#687bd5' },
        ];

        service
            .list()
            .then(d => {
                expect(d).toBe(sampleData);
                done();
            })
            .catch(done.fail);
        const req = httpMock.expectOne({
            url: `${serviceUrl}/tag`,
            method: 'GET',
        });
        req.flush(sampleData);
    });

    it('List should rely on cache the second call', done => {
        const sampleData: ITag[] = [
            { tag_id: 1, text: 'Test', color: '#9914ff' },
            { tag_id: 2, text: 'Test2', color: '#687bd5' },
        ];

        let _d: ITag[];
        service
            .list()
            .then(d => {
                _d = d;
                return service.list();
            })
            .then(d => {
                expect(d).toBe(_d);
                expect(d).toBe(sampleData);
                done();
            })
            .catch(done.fail);

        const req = httpMock.expectOne({
            url: `${serviceUrl}/tag`,
            method: 'GET',
        });
        req.flush(sampleData);

        httpMock.expectNone({
            url: `${serviceUrl}/tag`,
            method: 'GET',
        });
    });

    it('FullList should request tag/full', done => {
        const sampleData: ITagStat[] = [
            {
                color: '#fff',
                dive_count: 1,
                last_dive: new Date('2018-01-01'),
                tag_id: 1,
                text: 'test',
            },
        ];
        service
            .fullList()
            .then(d => {
                expect(d).toBe(sampleData);
                done();
            })
            .catch(done.fail);
        const req = httpMock.expectOne({
            url: `${serviceUrl}/tag/full`,
            method: 'GET',
        });
        req.flush(sampleData);
    });

    it('Clear cache should clear cache and request new data', done => {
        const sampleData: ITag[] = [
            { tag_id: 1, text: 'Test', color: '#9914ff' },
            { tag_id: 2, text: 'Test2', color: '#687bd5' },
        ];

        const sampleData_2: ITag[] = JSON.parse(JSON.stringify(sampleData));
        sampleData_2[0].text = 'new tag';

        let _d: ITag[];
        service
            .list()
            .then(d => {
                _d = d;
                return service.list();
            })
            .then(d => {
                expect(d).toBe(_d);
                expect(d).toBe(sampleData);
                service.clearCache();
                const prom = service.list();

                const req2 = httpMock.expectOne({
                    url: `${serviceUrl}/tag`,
                    method: 'GET',
                });
                req2.flush(sampleData_2);

                return prom;
            })
            .then(d => {
                expect(d).toBe(sampleData_2);
                expect(d).not.toBe(sampleData);
                done();
            })
            .catch(done.fail);

        const req = httpMock.expectOne({
            url: `${serviceUrl}/tag`,
            method: 'GET',
        });
        req.flush(sampleData);
    });

    it('Update should update tag and clear cache', done => {
        const sampleData: ITag = {
            tag_id: 1,
            color: '#fff',
            text: 'tester',
        };

        spyOn(service, 'clearCache');
        service
            .update(sampleData)
            .then(d => {
                expect(d).toBe(sampleData);
                expect(service.clearCache).toHaveBeenCalled();
                done();
            })
            .catch(done.fail);

        const req = httpMock.expectOne({
            url: `${serviceUrl}/tag/${sampleData.tag_id}`,
            method: 'PUT',
        });
        req.flush(sampleData);
    });

    it('Insert should post tag and clear cache', done => {
        const sampleData: ITag = {
            tag_id: undefined,
            color: '#fff',
            text: 'tester',
        };

        spyOn(service, 'clearCache');
        service
            .update(sampleData)
            .then(d => {
                expect(d).toBe(sampleData);
                expect(service.clearCache).toHaveBeenCalled();
                done();
            })
            .catch(done.fail);

        const req = httpMock.expectOne({
            url: `${serviceUrl}/tag`,
            method: 'POST',
        });
        const res = Object.assign({}, sampleData, { tag_id: 10 });
        req.flush(sampleData);
    });
    it('Delete should delete tag and clear cache', done => {
        spyOn(service, 'clearCache');
        service
            .delete(1)
            .then(d => {
                expect(d as any).toBe('TRUE');
                expect(service.clearCache).toHaveBeenCalled();
                done();
            })
            .catch(done.fail);

        const req = httpMock.expectOne({
            url: `${serviceUrl}/tag/${1}`,
            method: 'DELETE',
        });
        req.flush('TRUE');
    });
});
