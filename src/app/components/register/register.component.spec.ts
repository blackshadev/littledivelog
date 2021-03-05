import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { RegisterComponent } from './register.component';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { AuthService } from 'app/services/auth.service';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { Router } from '@angular/router';

describe('RegisterComponent', () => {
    let component: RegisterComponent;
    let fixture: ComponentFixture<RegisterComponent>;
    let registerSpy;
    let navigateSpy;
    const validData = {
        email: 'test@test.nl',
        password: 'test',
        confirmPassword: 'test',
        name: 'testy test',
    };

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            imports: [
                RouterTestingModule.withRoutes([]),
                HttpClientTestingModule,
                ReactiveFormsModule,
            ],
            declarations: [RegisterComponent],
            providers: [FormBuilder, AuthService],
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(RegisterComponent);
        component = fixture.componentInstance;

        registerSpy = spyOn(
            TestBed.get(AuthService),
            'register',
        ).and.resolveTo();
        navigateSpy = spyOn(TestBed.get(Router), 'navigate');

        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    describe('Form Validation', () => {
        it('should be invalid by default', () => {
            expect(component.form.valid).toBeFalse();
        });

        it('email should validate emails', () => {
            component.form.controls['email'].setValue('Test@test.com');
            expect(component.form.controls['email'].valid).toBeTrue();
        });

        it('email should validate emails invalid', () => {
            component.form.controls['email'].setValue('Testtest.com');
            expect(component.form.controls['email'].valid).toBeFalse();
        });

        it('password mismatch should be invalid', () => {
            component.form.controls['password'].setValue('test');
            component.form.controls['confirmPassword'].setValue('test2');
            expect(component.form.errors?.mismatchedPasswords).toBeTruthy();
        });

        it('should be valid when everything is filled', () => {
            component.form.controls['email'].setValue('Test@test.com');
            component.form.controls['password'].setValue('test');
            component.form.controls['confirmPassword'].setValue('test');
            component.form.controls['name'].setValue('testy test');
            expect(component.form.valid).toBeTrue();
        });
    });

    describe('Submit', () => {
        it('should call register on submit', async () => {
            component.form.setValue(validData);
            await component.onSubmit();

            expect(registerSpy).toHaveBeenCalled();
        });

        it('should call navigate', async () => {
            component.form.setValue(validData);
            await component.onSubmit();

            expect(navigateSpy).toHaveBeenCalledWith(['/login'], {
                queryParams: { msg: jasmine.any(String) },
            });
        });
    });
});
