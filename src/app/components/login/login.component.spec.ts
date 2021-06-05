import { ComponentFixture, TestBed, waitForAsync } from "@angular/core/testing";
import { Router, ActivatedRoute } from "@angular/router";
import { LoginComponent } from "./login.component";
import { AuthService } from "../../services/auth.service";
import { of } from "rxjs";
import { FormsModule } from "@angular/forms";
import { HttpClientTestingModule } from "@angular/common/http/testing";

describe("LoginComponent", () => {
    let component: LoginComponent;
    let fixture: ComponentFixture<LoginComponent>;

    const mockRouter = {
        navigate: jasmine.createSpy("navigate"),
    };

    beforeEach(
        waitForAsync(() => {
            TestBed.configureTestingModule({
                imports: [FormsModule, HttpClientTestingModule],
                declarations: [LoginComponent],
                providers: [
                    AuthService,
                    {
                        provide: Router,
                        useValue: mockRouter,
                    },
                    {
                        provide: ActivatedRoute,
                        useValue: {
                            queryParams: of({ returnUrl: "protected/url" }),
                        },
                    },
                ],
            }).compileComponents();
        }),
    );

    beforeEach(() => {
        fixture = TestBed.createComponent(LoginComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it("Should create", () => {
        expect(component).toBeTruthy();
    });
});
