import { ComponentFixture, TestBed, waitForAsync } from "@angular/core/testing";

import { BuddiesComponent } from "./buddies.component";
import { BuddyService, IBuddyStat } from "app/services/buddy.service";
import { RouterTestingModule } from "@angular/router/testing";
import { HttpClientTestingModule } from "@angular/common/http/testing";
import { ListDetailComponent } from "../controls/list-detail/list-detail.component";
import { BuddyDetailComponent } from "./buddy-detail/buddy-detail.component";
import { FormBuilder } from "@angular/forms";
import { HideWhenDirective } from "app/directives/hide-when/hide-when.directive";
import { By } from "@angular/platform-browser";
import { TagComponent } from "../controls/tags/tag/tag.component";
import { Router } from "@angular/router";

describe("BuddyComponent", () => {
    let component: BuddiesComponent;
    let fixture: ComponentFixture<BuddiesComponent>;
    let buddyService: jasmine.SpyObj<BuddyService>;
    let navigateSpy: jasmine.Spy<(p: string) => void>;
    const allBuddies: IBuddyStat[] = [
        {
            buddy_id: -1,
            buddy_user_id: -1,
            color: "#ccc",
            dive_count: 1,
            email: "test@test.nl",
            last_dive: new Date("2016-12-16T13:00:00"),
            text: "Tester Testy",
        },
        {
            buddy_id: -2,
            buddy_user_id: -2,
            color: "#ff0000",
            dive_count: 99,
            email: "tester@test.nl",
            last_dive: new Date("2010-01-01T13:00:00"),
            text: "Testy Tester",
        },
    ];

    beforeEach(
        waitForAsync(() => {
            TestBed.configureTestingModule({
                imports: [
                    RouterTestingModule.withRoutes([]),
                    HttpClientTestingModule,
                ],
                declarations: [
                    BuddiesComponent,
                    ListDetailComponent,
                    BuddyDetailComponent,
                    HideWhenDirective,
                    TagComponent,
                ],
                providers: [BuddyService, FormBuilder],
            }).compileComponents();
        }),
    );

    beforeEach(() => {
        buddyService = spyOnAllFunctions(TestBed.get(BuddyService));
        buddyService.fullList.and.resolveTo(allBuddies);
        navigateSpy = spyOn(TestBed.get(Router), "navigateByUrl");
        fixture = TestBed.createComponent(BuddiesComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it("should create", () => {
        expect(component).toBeTruthy();
    });

    it("should call BuddyService.FullList", () => {
        expect(buddyService.fullList).toHaveBeenCalled();
    });

    describe("with buddies", () => {
        // TODO: instead of using promises in services use observables which
        //          makes this better testable
        beforeEach((done) => {
            setTimeout(() => {
                fixture.detectChanges();
                done();
            }, 10);
        });

        it("should have buddies in view", () => {
            const elements = fixture.debugElement.queryAll(By.css(".badge"));

            expect(elements.length).toEqual(allBuddies.length);

            expect(
                elements.map((el) => el.nativeElement.textContent.trim()),
            ).toEqual(allBuddies.map((el) => el.text));
        });

        it("should select on row click", () => {
            const element = fixture.debugElement.query(
                By.css('tr[data-buddy_id="-1"'),
            );
            expect(element).toBeTruthy();

            const spy = spyOn(component, "select");
            spy.and.callThrough();

            element.triggerEventHandler("click", {});
            expect(spy).toHaveBeenCalled();

            expect(component.selected).toEqual(allBuddies[0]);
        });

        it("should navigate on click", () => {
            const element = fixture.debugElement.query(
                By.css('tr[data-buddy_id="-1"'),
            );
            expect(element).toBeTruthy();
            element.triggerEventHandler("click", {});

            expect(navigateSpy).toHaveBeenCalledWith("/buddy/-1");
        });
    });
});
