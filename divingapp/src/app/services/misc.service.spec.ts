import { TestBed, inject } from '@angular/core/testing';

import { MiscService } from './misc.service';
import {
    HttpClientTestingModule,
    HttpTestingController,
} from '@angular/common/http/testing';
import { HttpClient } from '@angular/common/http';
import { serviceUrl } from '../shared/config';
import * as FileSaver from 'file-saver';
import { OS } from './browser-detector.constants';

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

    it('Should be created', () => {
        expect(service).toBeTruthy();
    });

    it('Get Uploader for linux', (done) => {
        const spy = spyOn(FileSaver, 'saveAs');
        service.getUploader(OS.Linux).subscribe((d) => {
            expect(spy).toHaveBeenCalled();
            done();
        }, done.fail);

        const req = httpMock.expectOne({
            url: `${serviceUrl}/dive-uploader/download/latest/unix`,
            method: 'GET',
        });

        const data = new ArrayBuffer(4);
        data[0] = 't';
        data[1] = 'e';
        data[2] = 's';
        data[3] = 'T';
        req.flush(data, {
            headers: {
                'Content-Disposition': 'attachment; filename="test.exe"',
            },
        });
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
        const data = new ArrayBuffer(4);
        data[0] = 't';
        data[1] = 'e';
        data[2] = 's';
        data[3] = 'T';

        req.flush(data, {
            headers: {
                'Content-Disposition': 'attachment; filename="test.exe"',
            },
        });
    });
});
