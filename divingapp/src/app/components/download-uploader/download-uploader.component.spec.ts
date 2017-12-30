import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DownloadUploaderComponent } from './download-uploader.component';

describe('DownloadUploaderComponent', () => {
  let component: DownloadUploaderComponent;
  let fixture: ComponentFixture<DownloadUploaderComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DownloadUploaderComponent ]
    })
    .compileComponents();
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
