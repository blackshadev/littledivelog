import { ComponentFixture, TestBed, waitForAsync } from "@angular/core/testing";

import { BaseModalComponent } from "./base-modal.component";

describe("BaseComponent", () => {
    let component: BaseModalComponent;
    let fixture: ComponentFixture<BaseModalComponent>;

    beforeEach(
        waitForAsync(() => {
            TestBed.configureTestingModule({
                declarations: [BaseModalComponent],
            }).compileComponents();
        }),
    );

    beforeEach(() => {
        fixture = TestBed.createComponent(BaseModalComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it("should create", () => {
        expect(component).toBeTruthy();
    });
});
