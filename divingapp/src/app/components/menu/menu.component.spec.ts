import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MenuComponent } from './menu.component';
import { AuthService } from 'app/services/auth.service';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { By } from '@angular/platform-browser';

fdescribe('MenuComponent', () => {
    let component: MenuComponent;
    let fixture: ComponentFixture<MenuComponent>;
    let service: {
        isLoggedIn: boolean;
        logout: jasmine.Spy<() => void>;
    };

    beforeEach(async(() => {
        service = {
            isLoggedIn: false,
            logout: jasmine.createSpy('logout'),
        };
        TestBed.configureTestingModule({
            imports: [HttpClientTestingModule],
            declarations: [MenuComponent],
            providers: [
                {
                    provide: AuthService,
                    useValue: service,
                },
            ],
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(MenuComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    describe('LoggedIn', () => {
        beforeEach(() => {
            (service as any).isLoggedIn = true;
            fixture.detectChanges();
        });

        it('should logout be visible', () => {
            const element = fixture.debugElement.query(
                By.css('li[data-test-name="logout"]'),
            );
            expect(element).toBeTruthy();
        });

        it('should profile be visible', () => {
            const element = fixture.debugElement.query(
                By.css('li[data-test-name="profile"]'),
            );
            expect(element).toBeTruthy();
        });
    });
});
