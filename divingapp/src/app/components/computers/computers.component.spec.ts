import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ComputersComponent } from './computers.component';
import { DiveService, IComputer } from 'app/services/dive.service';
import { spyOnClass, Spied } from 'test-common/spyOnClass';

describe('ComputersComponent', () => {
    let component: ComputersComponent;
    let fixture: ComponentFixture<ComputersComponent>;
    let mockService: Spied<DiveService>;
    let computers: IComputer[] = [ { computer_id: -1, dive_count: 0, last_read: new Date, name: "test", vendor: "test" }];

    beforeEach(async(() => {
        mockService = spyOnClass(DiveService);
        mockService.listComputers.and.resolveTo(computers);

        TestBed.configureTestingModule({
            declarations: [ComputersComponent],
            providers: [
                { provide: DiveService, useValue: mockService }
            ]
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(ComputersComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it("should have called listComputers", () => {
        expect(mockService.listComputers).toHaveBeenCalled();
    });
    
});
