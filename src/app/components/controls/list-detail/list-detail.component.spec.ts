import { ComponentFixture, TestBed, waitForAsync } from "@angular/core/testing";

import { ListDetailComponent } from "./list-detail.component";

describe("ListDetailComponent", () => {
    let component: ListDetailComponent;
    let fixture: ComponentFixture<ListDetailComponent>;

    beforeEach(
        waitForAsync(() => {
            TestBed.configureTestingModule({
                declarations: [ListDetailComponent],
            }).compileComponents();
        }),
    );

    beforeEach(() => {
        fixture = TestBed.createComponent(ListDetailComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it("should create", () => {
        expect(component).toBeTruthy();
    });
});
