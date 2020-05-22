import { TestBed, inject } from '@angular/core/testing';

import { MiscService } from './misc.service';
import {
    HttpClientTestingModule,
    HttpTestingController,
} from '@angular/common/http/testing';
import { HttpClient } from '@angular/common/http';
import { serviceUrl } from '../shared/config';
import * as FileSaver from 'file-saver';
import { OS } from './browser-detector.service';

describe('MiscService', () => {
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

    it('Get Uploader for linux', (done) => {
        const spy = spyOn(FileSaver, 'saveAs');
        service.getUploader(OS.Window).subscribe((d) => {
            expect(spy).toHaveBeenCalled();
            done();
        }, done.fail);

        const req = httpMock.expectOne({
            url: `${serviceUrl}/dive-uploader/download/latest/unix`,
            method: 'GET',
        });
        req.flush('');
    });

    it('Get Uploader for windows', (done) => {
        const spy = spyOn(FileSaver, 'saveAs');
        service.getUploader(OS.Window).subscribe((d) => {
            expect(spy).toHaveBeenCalled();
            done();
        }, done.fail);

        const req = httpMock.expectOne({
            url: `${serviceUrl}/dive-uploader/download/latest/win32`,
            method: 'GET',
        });
        req.flush('');
    });
});
