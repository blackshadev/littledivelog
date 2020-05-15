import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { DownloadUploaderComponent } from './download-uploader.component';
import { MiscService } from 'app/services/misc.service';
import { By } from '@angular/platform-browser';
import { HttpClientTestingModule } from '@angular/common/http/testing';

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
        fixture = TestBed.createComponent(DownloadUploaderComponent);
        component = fixture.componentInstance;
        service = spyOnAllFunctions(TestBed.get(MiscService));
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('Should call download on button click', () => {
        const element = fixture.debugElement.query(By.css('button'));
        element.triggerEventHandler('click', {});
        expect(service.getUploader).toHaveBeenCalled();
    });
});
