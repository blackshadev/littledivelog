import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { DownloadUploaderComponent } from './download-uploader.component';
import { MiscService } from 'app/services/misc.service';
import { By } from '@angular/platform-browser';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { OS } from 'app/services/browser-detector.constants';

describe('DownloadUploaderComponent', () => {
    let component: DownloadUploaderComponent;
    let fixture: ComponentFixture<DownloadUploaderComponent>;
    let service: jasmine.SpyObj<MiscService>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            imports: [HttpClientTestingModule],
            declarations: [DownloadUploaderComponent],
            providers: [MiscService],
        }).compileComponents();
    }));

    beforeEach(() => {
        service = spyOnAllFunctions(TestBed.inject(MiscService));
        service.getUploaderUrl.withArgs(OS.Linux).and.returnValue('unix-url');
        service.getUploaderUrl.withArgs(OS.Window).and.returnValue('win-url');

        fixture = TestBed.createComponent(DownloadUploaderComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('Should have retrieved url from service', () => {
        expect(service.getUploaderUrl).toHaveBeenCalledWith(OS.Linux);
        expect(service.getUploaderUrl).toHaveBeenCalledWith(OS.Window);
    });

    it('Should have download links', () => {
        const unixUrl = fixture.debugElement.query(By.css('a[href="unix-url"'));
        const winUrl = fixture.debugElement.query(By.css('a[href="win-url"'));
        expect(unixUrl).toBeTruthy();
        expect(winUrl).toBeTruthy();
    })
});
