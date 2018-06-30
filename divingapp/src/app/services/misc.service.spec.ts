import { TestBed, inject } from '@angular/core/testing';

import { MiscService } from './misc.service';
import {
    HttpClientTestingModule,
    HttpTestingController,
} from '@angular/common/http/testing';
import { HttpClient } from '@angular/common/http';
import { serviceUrl } from '../shared/config';
import * as FileSaver from 'file-saver';

fdescribe('MiscService', () => {
    let service: MiscService;
    let httpMock: HttpTestingController;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [HttpClientTestingModule],
            providers: [HttpClient, MiscService],
        });

        service = TestBed.get(MiscService);
        httpMock = TestBed.get(HttpTestingController);
    });

    it('Should be created', inject([MiscService], (ser: MiscService) => {
        expect(service).toBeTruthy();
        expect(ser).toBe(service);
    }));

    it('Get Uploader', done => {
        const spy = spyOn(FileSaver, 'saveAs');
        service
            .getUploader()
            .then(d => {
                expect(spy).toHaveBeenCalled();
                done();
            })
            .catch(done.fail);

        const req = httpMock.expectOne({
            url: `${serviceUrl}/dive-uploader/download`,
            method: 'GET',
        });
        const data = new ArrayBuffer(4);
        data[0] = 't';
        data[1] = 'e';
        data[2] = 's';
        data[3] = 'T';

        req.flush(data);
    });
});
