import { ComponentFixture, TestBed, waitForAsync } from "@angular/core/testing";

import { DashboardComponent } from "./dashboard.component";
import { ProfileService, IProfile } from "app/services/profile.service";
import { HttpClientTestingModule } from "@angular/common/http/testing";
import { LocaldatetimePipe } from "app/pipes/localdatetime.pipe";
import { HideWhenDirective } from "app/directives/hide-when/hide-when.directive";
import { By } from "@angular/platform-browser";

describe("DashboardComponent", () => {
    let component: DashboardComponent;
    let fixture: ComponentFixture<DashboardComponent>;
    let profile: jasmine.SpyObj<ProfileService>;
    const profileResult: IProfile = {
        buddy_count: 2,
        computer_count: 1,
        dive_count: 91,
        email: "test@test.com",
        inserted: new Date("2019-12-12T13:00:00Z"),
        name: "Test",
        tag_count: 2,
    };

    beforeEach(
        waitForAsync(() => {
            TestBed.configureTestingModule({
                declarations: [
                    DashboardComponent,
                    LocaldatetimePipe,
                    HideWhenDirective,
                ],
                providers: [ProfileService],
                imports: [HttpClientTestingModule],
            }).compileComponents();
        }),
    );

    beforeEach(() => {
        profile = spyOnAllFunctions(TestBed.get(ProfileService));
        profile.get.and.resolveTo(profileResult);
        fixture = TestBed.createComponent(DashboardComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    beforeEach((done) => {
        setTimeout(() => {
            fixture.detectChanges();
            done();
        }, 10);
    });

    it("should create", () => {
        expect(component).toBeTruthy();
    });

    it("should be called", () => {
        expect(profile.get).toHaveBeenCalled();
    });

    it("should see dive count", () => {
        const element = fixture.debugElement.query(
            By.css('span[data-test-name="dive-count"]'),
        );
        expect(element.nativeElement.textContent.trim()).toEqual(
            profileResult.dive_count + "",
        );
    });
});
