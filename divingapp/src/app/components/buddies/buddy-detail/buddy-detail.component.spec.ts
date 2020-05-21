import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { BuddyDetailComponent } from './buddy-detail.component';
import { BuddyService, IBuddyStat } from 'app/services/buddy.service';
import { FormBuilder, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { ColorPickerModule } from 'ngx-color-picker';
import { RouterTestingModule } from '@angular/router/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { DetailComponentComponent } from 'app/components/controls/detail-component/detail-component.component';

describe('BuddyDetailComponent', () => {
    let component: BuddyDetailComponent;
    let fixture: ComponentFixture<BuddyDetailComponent>;
    let service: jasmine.SpyObj<BuddyService>;

    const fakeDetailComponent: jasmine.SpyObj<DetailComponentComponent> = jasmine.createSpyObj(
        'DetailComponent',
        ['reset'],
    );

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            imports: [
                ColorPickerModule,
                ReactiveFormsModule,
                FormsModule,
                RouterTestingModule.withRoutes([]),
                HttpClientTestingModule,
            ],
            declarations: [BuddyDetailComponent, DetailComponentComponent],
            providers: [BuddyService, FormBuilder],
        }).compileComponents();
        service = spyOnAllFunctions<BuddyService>(TestBed.get(BuddyService));
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(BuddyDetailComponent);
        component = fixture.componentInstance;
        component.detailComponent = fakeDetailComponent;
        spyOn(component.onDataChanged, 'emit');
        spyOn(component, 'back');
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    describe('with new tag', () => {
        const tag: IBuddyStat = {
            color: '#33ee00',
            email: null,
            buddy_id: undefined,
            buddy_user_id: null,
            dive_count: null,
            last_dive: null,
            text: null,
        };
        beforeEach(() => {
            component.buddy = Object.assign({}, tag);
            fixture.detectChanges();
        });

        it('form should be invalid', () => {
            expect(component.form.invalid).toBeTrue();
        });

        describe('delete', () => {
            beforeEach(async () => {
                await component.delete();
            });

            it('should not call service delete ', () => {
                expect(service.delete).not.toHaveBeenCalled();
            });

            it('should call back', () => {
                expect(component.back).toHaveBeenCalled();
            });
        });

        describe('insert', () => {
            const newBuddyValues = {
                buddy_id: -2,
                color: '#fefefe',
                text: 'TestColor',
                email: 'tester@tester.nl',
            };
            beforeEach(async () => {
                service.update.and.resolveTo(newBuddyValues);
                component.form.controls.color.setValue(newBuddyValues.color);
                component.form.controls.text.setValue(newBuddyValues.text);
                component.form.controls.email.setValue(newBuddyValues.email);
                await component.submit();
            });

            it('Should call update service', () => {
                expect(service.update).toHaveBeenCalledWith({
                    buddy_id: undefined,
                    text: newBuddyValues.text,
                    color: newBuddyValues.color,
                    email: newBuddyValues.email,
                });
            });

            it('Should update tag', () => {
                expect(component.buddy).toEqual(
                    jasmine.objectContaining({
                        text: newBuddyValues.text,
                        color: newBuddyValues.color,
                    }),
                );
            });

            it('should call onDataChanged', () => {
                expect(component.onDataChanged.emit).toHaveBeenCalledWith({
                    type: 'insert',
                    key: newBuddyValues.buddy_id,
                });
            });
        });
    });

    describe('with existing tag', () => {
        const buddy: IBuddyStat = {
            buddy_id: -1,
            color: '#ff0000',
            dive_count: 5,
            last_dive: new Date('2019-12-12T12:12:12'),
            text: 'TestTag',
            email: 'test@test.nl',
            buddy_user_id: null,
        };
        beforeEach(() => {
            component.buddy = Object.assign({}, buddy);
            fixture.detectChanges();
        });

        it('should fill form', () => {
            expect(component.form.value).toEqual({
                text: buddy.text,
                color: buddy.color,
                email: 'test@test.nl',
            });
        });

        it('should not submit on invalid form', () => {
            component.form.controls.color.setValue('invalid-color');
            component.submit();
            expect(service.update).not.toHaveBeenCalled();
        });

        describe('Update', () => {
            beforeEach(async () => {
                component.form.controls.color.setValue('#0000ff');
                service.update.and.resolveTo(buddy);
                await component.submit();
            });

            it('Should call service update', () => {
                expect(service.update).toHaveBeenCalled();
            });

            it('Should call detailcomponent reset', () => {
                expect(fakeDetailComponent.reset).toHaveBeenCalled();
            });

            it('Should hold new data', () => {
                expect(component.buddy).toEqual(
                    jasmine.objectContaining({
                        color: '#0000ff',
                    }),
                );
            });

            it('should called onDatachange event', () => {
                expect(component.onDataChanged.emit).toHaveBeenCalledWith({
                    type: 'update',
                    key: buddy.buddy_id,
                });
            });
        });

        describe('Delete', () => {
            beforeEach(async () => {
                await component.delete();
            });

            it('should call delete service', async () => {
                expect(service.delete).toHaveBeenCalledWith(buddy.buddy_id);
            });

            it('should call back', async () => {
                expect(component.back).toHaveBeenCalled();
            });

            it('should called onDatachange event', () => {
                expect(component.onDataChanged.emit).toHaveBeenCalledWith({
                    type: 'delete',
                    key: buddy.buddy_id,
                });
            });
        });
    });
});
