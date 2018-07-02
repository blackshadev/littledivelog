import { TestBed, inject } from '@angular/core/testing';

import { TagService } from './tag.service';
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
                done();
            })
            .catch(done.fail);
        const req = httpMock.expectOne({
            url: `${serviceUrl}/tag/`,
            method: 'GET',
        });
        req.flush({});
    });
});
