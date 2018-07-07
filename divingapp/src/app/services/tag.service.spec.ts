import { TestBed, inject } from '@angular/core/testing';

import { TagService, ITagStat } from './tag.service';
import {
    HttpClientTestingModule,
    HttpTestingController,
} from '@angular/common/http/testing';
import { HttpClient } from '@angular/common/http';
import { serviceUrl } from '../shared/config';
import { ITag } from '../components/controls/tags/tags.component';

fdescribe('TagService', () => {
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
            url: `${serviceUrl}/tag/`,
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
            url: `${serviceUrl}/tag/`,
            method: 'GET',
        });
        req.flush(sampleData);

        httpMock.expectNone({
            url: `${serviceUrl}/tag/`,
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

    it('Clear cache should clear cache and request new data');
    it('Update should update tag and clear cache');
    it('Insert should post tag and clear cache');
    it('Delete should delete tag and clear cache');
});
