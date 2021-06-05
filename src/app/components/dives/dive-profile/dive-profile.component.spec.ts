import { ComponentFixture, TestBed, waitForAsync } from "@angular/core/testing";

import { DiveProfileComponent } from "./dive-profile.component";
import { DiveService } from "app/services/dive.service";
import { HttpClientTestingModule } from "@angular/common/http/testing";
import { TagService } from "app/services/tag.service";
import { BuddyService } from "app/services/buddy.service";
import { DivetimePipe } from "app/pipes/divetime.pipe";

describe("DiveProfileComponent", () => {
    let component: DiveProfileComponent;
    let fixture: ComponentFixture<DiveProfileComponent>;

    beforeEach(
        waitForAsync(() => {
            TestBed.configureTestingModule({
                imports: [HttpClientTestingModule],
                declarations: [DiveProfileComponent, DivetimePipe],
                providers: [DiveService, BuddyService, TagService],
            }).compileComponents();
        }),
    );

    beforeEach(() => {
        fixture = TestBed.createComponent(DiveProfileComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it("should create", () => {
        expect(component).toBeTruthy();
    });
});
