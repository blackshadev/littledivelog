import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DivesComponent } from './dives.component';

describe('DivesComponent', () => {
  let component: DivesComponent;
  let fixture: ComponentFixture<DivesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DivesComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DivesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
