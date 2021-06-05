import { ComponentFixture, TestBed, waitForAsync } from "@angular/core/testing";

import { TagsControlComponent } from "./tags-control.component";

describe("TagsComponent", () => {
    let component: TagsControlComponent;
    let fixture: ComponentFixture<TagsControlComponent>;

    beforeEach(
        waitForAsync(() => {
            TestBed.configureTestingModule({
                declarations: [TagsControlComponent],
            }).compileComponents();
        }),
    );

    beforeEach(() => {
        fixture = TestBed.createComponent(TagsControlComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it("should create", () => {
        expect(component).toBeTruthy();
    });
});
