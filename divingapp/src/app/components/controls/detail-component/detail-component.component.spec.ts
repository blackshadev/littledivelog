import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DetailComponentComponent } from './detail-component.component';
import {
    ReactiveFormsModule,
    FormBuilder,
    Validators,
    FormsModule,
} from '@angular/forms';
import { By } from '@angular/platform-browser';

const formBuilder: FormBuilder = new FormBuilder();

fdescribe('DetailComponentComponent', () => {
    let component: DetailComponentComponent;
    let fixture: ComponentFixture<DetailComponentComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            imports: [ReactiveFormsModule, FormsModule],
            providers: [FormBuilder],
            declarations: [DetailComponentComponent],
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(DetailComponentComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    const data = {
        firstName: 'Testy',
        lastName: 'Test',
        age: '48',
    };

    describe('with form', () => {
        beforeEach(() => {
            const form = formBuilder.group({
                firstName: ['', [Validators.required]],
                lastName: ['', [Validators.required]],
                age: [null, [Validators.pattern(/\d/)]],
            });
            component.form = form;
            fixture.detectChanges();
        });

        it('save button should be disabled', () => {
            console.log(
                !component.isNew,
                !component.formDirty,
                component.formValid,
            );
            const but = fixture.debugElement.query(
                By.css('button[name=submit]'),
            );
            expect(but.nativeElement.disabled).toBeTrue();
        });

        it('reset button should be disabled', () => {
            const but = fixture.debugElement.query(
                By.css('button[name=reset]'),
            );
            expect(but.nativeElement.disabled).toBeTrue();
        });

        it('form default not dirty', () => {
            expect(component.formDirty).toBeFalse();
        });

        it('form default diagnostic', () => {
            expect(component.diagnostic.invalid).toEqual({
                firstName: true,
                lastName: true,
            });

            expect(component.diagnostic.value).toEqual({
                firstName: '',
                lastName: '',
                age: null,
            });

            expect(component.diagnostic.formDirty).toBeFalse();
            expect(component.diagnostic.dirty).toEqual({});
        });

        describe('with new data', () => {
            beforeEach(() => {
                component.form.controls.firstName.setValue(data.firstName);
                component.form.controls.lastName.setValue(data.lastName);
                component.form.controls.age.setValue(data.age);
                component.form.controls.firstName.markAsDirty();
                component.form.controls.lastName.markAsDirty();
                component.form.controls.age.markAsDirty();
                fixture.detectChanges();
            });

            it('save button should be enabled', () => {
                const but = fixture.debugElement.query(
                    By.css('button[name=submit]'),
                );
                expect(but.nativeElement.disabled).toBeFalse();
            });

            it('reset button should be enabled', () => {
                const but = fixture.debugElement.query(
                    By.css('button[name=reset]'),
                );
                expect(but.nativeElement.disabled).toBeFalse();
            });

            it('should be dirty', () => {
                expect(component.formDirty).toBeTrue();
            });

            it('check diagnostics', () => {
                expect(component.diagnostic.invalid).toEqual({});
                expect(component.diagnostic.value).toEqual(data);
                expect(component.diagnostic.formDirty).toBeTrue();
                expect(component.diagnostic.dirty).toEqual({
                    firstName: true,
                    lastName: true,
                    age: true,
                });
            });
        });

        describe('With invalid data', () => {
            beforeEach(() => {
                component.form.controls.firstName.setValue(data.firstName);
                component.form.controls.lastName.setValue(data.lastName);
                component.form.controls.age.setValue('test');
                component.form.controls.firstName.markAsDirty();
                component.form.controls.lastName.markAsDirty();
                component.form.controls.age.markAsDirty();
                fixture.detectChanges();
            });

            it('should disabled save on invalid form', () => {
                console.log(component.form.controls.age.valid);
                expect(component.form.controls.age.valid).toBeFalse();
                const but = fixture.debugElement.query(
                    By.css('button[name=submit]'),
                );

                expect(but.nativeElement.disabled).toBeTrue();
            });
        });

        describe('with old data', () => {
            beforeEach(() => {
                component.data = data;
            });

            it('should have data', () => {
                expect(component.form.value).toEqual(data);
            });

            it('should reset after change', () => {
                component.form.controls.age.setValue('1');
                expect(component.form.value.age).toEqual('1');
                component.reset();
                expect(component.form.value.age).toEqual(data.age);
            });
        });
    });
});
