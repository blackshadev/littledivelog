import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DiveListComponent } from './dive-list.component';

describe('DiveListComponent', () => {
  let component: DiveListComponent;
  let fixture: ComponentFixture<DiveListComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DiveListComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DiveListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
