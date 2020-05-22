import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DownloadUploaderComponent } from './download-uploader.component';
import { MiscService } from 'app/services/misc.service';
import { BrowserDetectorService } from 'app/services/browser-detector.service';

describe('DownloadUploaderComponent', () => {
    let component: DownloadUploaderComponent;
    let fixture: ComponentFixture<DownloadUploaderComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [DownloadUploaderComponent],
            providers: [MiscService, BrowserDetectorService],
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(DownloadUploaderComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
