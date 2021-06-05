import { TestBed, ComponentFixture, waitForAsync } from "@angular/core/testing";
import { AppComponent } from "./app.component";
import { MenuComponent } from "./components/menu/menu.component";
import { BaseModalComponent } from "./components/modals/base/base-modal.component";
import { RouterTestingModule } from "@angular/router/testing";
import { ErrorModalComponent } from "./components/modals/error/error-modal.component";
import { AuthService } from "./services/auth.service";
import { HttpClientTestingModule } from "@angular/common/http/testing";
import { Title } from "@angular/platform-browser";

describe("AppComponent", () => {
    let app: AppComponent;
    let fixture: ComponentFixture<AppComponent>;
    beforeEach(
        waitForAsync(() => {
            TestBed.configureTestingModule({
                declarations: [
                    AppComponent,
                    MenuComponent,
                    BaseModalComponent,
                    ErrorModalComponent,
                ],
                providers: [AuthService, Title],
                imports: [RouterTestingModule, HttpClientTestingModule],
            }).compileComponents();
        }),
    );

    beforeEach(() => {
        fixture = TestBed.createComponent(AppComponent);
        app = fixture.debugElement.componentInstance;
    });

    it("should create the app", () => {
        expect(app).toBeTruthy();
    });
});
