import { ComponentFixture, TestBed, waitForAsync } from "@angular/core/testing";

import { MenuComponent } from "./menu.component";
import { AuthService } from "app/services/auth.service";
import { HttpClientTestingModule } from "@angular/common/http/testing";
import { By } from "@angular/platform-browser";
import { RouterTestingModule } from "@angular/router/testing";

describe("MenuComponent", () => {
    let component: MenuComponent;
    let fixture: ComponentFixture<MenuComponent>;
    let service: {
        isLoggedIn: boolean;
        logout: jasmine.Spy<() => void>;
    };

    beforeEach(
        waitForAsync(() => {
            service = {
                isLoggedIn: false,
                logout: jasmine.createSpy("logout"),
            };
            TestBed.configureTestingModule({
                imports: [
                    HttpClientTestingModule,
                    RouterTestingModule.withRoutes([]),
                ],
                declarations: [MenuComponent],
                providers: [
                    {
                        provide: AuthService,
                        useValue: service,
                    },
                ],
            }).compileComponents();
        }),
    );

    beforeEach(() => {
        fixture = TestBed.createComponent(MenuComponent);
        component = fixture.componentInstance;
        spyOn(component.ontoggle, "emit");
        fixture.detectChanges();
    });

    it("should create", () => {
        expect(component).toBeTruthy();
    });

    it("Should display login", () => {
        const element = fixture.debugElement.query(
            By.css('li[data-test-name="login"]'),
        );
        expect(element).toBeTruthy();
    });

    describe("When Logged In", () => {
        beforeEach(() => {
            (service as any).isLoggedIn = true;
            fixture.detectChanges();
        });

        it("should logout be visible", () => {
            const element = fixture.debugElement.query(
                By.css('li[data-test-name="logout"]'),
            );
            expect(element).toBeTruthy();
        });

        it("should profile be visible", () => {
            const element = fixture.debugElement.query(
                By.css('li[data-test-name="profile"]'),
            );
            expect(element).toBeTruthy();
        });
    });

    it("Should call logout service", () => {
        component.logout();
        expect(service.logout).toHaveBeenCalled();
    });

    it("Should toggle on state change", () => {
        spyOn(component, "toggle");
        component.state = true;
        expect(component.toggle).toHaveBeenCalled();
    });

    describe("Toggle", () => {
        beforeEach(() => {
            component.toggle();
            fixture.detectChanges();
        });

        it("Should emit ontoggle", () =>
            expect(component.ontoggle.emit).toHaveBeenCalled());

        it("should have collapsed", () => {
            const element = fixture.debugElement.query(
                By.css(".menu-container.collapsed"),
            ).nativeElement as HTMLElement;
            expect(element).toBeTruthy();
        });

        it("On double toggle should not have collapsed", () => {
            component.toggle();
            const element = fixture.debugElement.query(
                By.css(".menu-container:not(.collapsed)"),
            ).nativeElement as HTMLElement;
            expect(element).toBeTruthy();
        });
    });
});
