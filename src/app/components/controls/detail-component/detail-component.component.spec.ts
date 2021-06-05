import { ComponentFixture, TestBed, waitForAsync } from "@angular/core/testing";

import { DetailComponentComponent } from "./detail-component.component";
import {
    ReactiveFormsModule,
    FormBuilder,
    Validators,
    FormsModule,
} from "@angular/forms";
import { By } from "@angular/platform-browser";
import { Component, TemplateRef, ViewChild } from "@angular/core";

const formBuilder: FormBuilder = new FormBuilder();

@Component({
    template: `<ng-template #templ>
        <input class="form-control" name="firstName" />
        <input class="form-control" name="lastName" />
        <input class="form-control" name="age" />
    </ng-template>`,
})
class WrapperComponent {
    @ViewChild("templ") public templateref: TemplateRef<any>;
}

describe("DetailComponentComponent", () => {
    let component: DetailComponentComponent;
    let fixture: ComponentFixture<DetailComponentComponent>;

    beforeEach(
        waitForAsync(() => {
            TestBed.configureTestingModule({
                imports: [ReactiveFormsModule, FormsModule],
                providers: [FormBuilder],
                declarations: [DetailComponentComponent, WrapperComponent],
            }).compileComponents();
        }),
    );

    beforeEach(() => {
        fixture = TestBed.createComponent(DetailComponentComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it("should create", () => {
        expect(component).toBeTruthy();
    });

    it("should emit back", () => {
        const backSpy = spyOn(component.onBack, "emit");
        const but = fixture.debugElement
            .query(By.css('button[name="back"]'))
            .nativeElement.dispatchEvent(new Event("click"));

        fixture.detectChanges();

        expect(backSpy).toHaveBeenCalled();
    });

    it("should emit reset", () => {
        const resetSpy = spyOn(component, "reset");
        const but = fixture.debugElement
            .query(By.css('button[name="reset"]'))
            .nativeElement.dispatchEvent(new Event("click"));

        fixture.detectChanges();

        expect(resetSpy).toHaveBeenCalled();
    });

    describe("Form Control", () => {
        const data = {
            firstName: "Testy",
            lastName: "Test",
            age: "48",
        };

        beforeEach(() => {
            const form = formBuilder.group({
                firstName: ["", [Validators.required]],
                lastName: ["", [Validators.required]],
                age: [null, [Validators.pattern(/\d/)]],
            });
            component.form = form;
            fixture.detectChanges();
        });

        it("save button should be disabled", () => {
            const but = fixture.debugElement.query(
                By.css("button[name=submit]"),
            );
            expect(but.nativeElement.disabled).toBeTrue();
        });

        it("reset button should be disabled", () => {
            const but = fixture.debugElement.query(
                By.css("button[name=reset]"),
            );
            expect(but.nativeElement.disabled).toBeTrue();
        });

        it("form default not dirty", () => {
            expect(component.formDirty).toBeFalse();
        });

        it("form default diagnostic", () => {
            expect(component.diagnostic.invalid).toEqual({
                firstName: true,
                lastName: true,
            });

            expect(component.diagnostic.value).toEqual({
                firstName: "",
                lastName: "",
                age: null,
            });

            expect(component.diagnostic.formDirty).toBeFalse();
            expect(component.diagnostic.dirty).toEqual({});
        });

        describe("with new data", () => {
            beforeEach(() => {
                component.form.controls.firstName.setValue(data.firstName);
                component.form.controls.lastName.setValue(data.lastName);
                component.form.controls.age.setValue(data.age);
                component.form.controls.firstName.markAsDirty();
                component.form.controls.lastName.markAsDirty();
                component.form.controls.age.markAsDirty();
                fixture.detectChanges();
            });

            it("save button should be enabled", () => {
                const but = fixture.debugElement.query(
                    By.css("button[name=submit]"),
                );
                expect(but.nativeElement.disabled).toBeFalse();
            });

            it("reset button should be enabled", () => {
                const but = fixture.debugElement.query(
                    By.css("button[name=reset]"),
                );
                expect(but.nativeElement.disabled).toBeFalse();
            });

            it("should be dirty", () => {
                expect(component.formDirty).toBeTrue();
            });

            it("check diagnostics", () => {
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

        describe("With invalid data", () => {
            beforeEach(() => {
                component.form.controls.firstName.setValue(data.firstName);
                component.form.controls.lastName.setValue(data.lastName);
                component.form.controls.age.setValue("test");
                component.form.controls.firstName.markAsDirty();
                component.form.controls.lastName.markAsDirty();
                component.form.controls.age.markAsDirty();
                fixture.detectChanges();
            });

            it("should disabled save on invalid form", () => {
                expect(component.form.controls.age.valid).toBeFalse();
                const but = fixture.debugElement.query(
                    By.css("button[name=submit]"),
                );

                expect(but.nativeElement.disabled).toBeTrue();
            });
        });

        describe("with old data", () => {
            beforeEach(() => {
                component.data = data;
            });

            it("should have data", () => {
                expect(component.form.value).toEqual(data);
            });

            it("should reset after change", () => {
                component.form.controls.age.setValue("1");
                expect(component.form.value.age).toEqual("1");
                component.reset();
                expect(component.form.value.age).toEqual(data.age);
            });
        });
    });

    describe("Template", () => {
        let templateFixture: ComponentFixture<WrapperComponent>;
        beforeEach(() => {
            templateFixture = TestBed.createComponent(WrapperComponent);
            templateFixture.detectChanges();
            component.pages = {
                Test: templateFixture.componentInstance.templateref,
            };
            component.defaultPage = "Test";
            fixture.detectChanges();
        });

        it("Should have inputs from template", () => {
            expect(
                fixture.debugElement.query(By.css("input[name=age]")),
            ).toBeTruthy();
        });

        it("Should have tab-panel from template", () => {
            expect(
                fixture.debugElement.query(
                    By.css('.tab-pane[id="Test"].active'),
                ),
            ).toBeTruthy();
        });

        it("Should focus next input on enter", () => {
            const onEnterSpy = spyOn(component, "onEnter").and.callThrough();
            const selectSpy = spyOn(
                fixture.debugElement.query(By.css('input[name="lastName"]'))
                    .nativeElement,
                "select",
            );

            fixture.debugElement
                .query(By.css('input[name="firstName"]'))
                .nativeElement.focus();

            fixture.debugElement
                .query(By.css("form"))
                .triggerEventHandler("keydown.enter", {
                    preventDefault() {},
                    target: fixture.debugElement.query(
                        By.css('input[name="firstName"]'),
                    ).nativeElement,
                });
            fixture.detectChanges();

            expect(onEnterSpy).toHaveBeenCalled();
            expect(selectSpy).toHaveBeenCalled();
        });
    });
});
