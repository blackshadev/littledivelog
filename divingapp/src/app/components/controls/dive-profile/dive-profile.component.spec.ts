import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DiveProfileComponent } from './dive-profile.component';

describe('DiveProfileComponent', () => {
  let component: DiveProfileComponent;
  let fixture: ComponentFixture<DiveProfileComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DiveProfileComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DiveProfileComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
