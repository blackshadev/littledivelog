import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TagDetailComponent } from './tag-detail.component';
import { TagService, ITagStat } from 'app/services/tag.service';
import { FormBuilder, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { DetailComponentComponent } from 'app/components/controls/detail-component/detail-component.component';
import { ColorPickerModule } from 'ngx-color-picker';
import { BrowserModule } from '@angular/platform-browser';
import { EventEmitter } from 'protractor';

describe('TagDetailComponent', () => {
    let component: TagDetailComponent;
    let fixture: ComponentFixture<TagDetailComponent>;
    let service: jasmine.SpyObj<TagService>;

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
            declarations: [TagDetailComponent, DetailComponentComponent],
            providers: [TagService, FormBuilder],
        }).compileComponents();

        service = spyOnAllFunctions<TagService>(TestBed.get(TagService));
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(TagDetailComponent);
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
        const tag: ITagStat = {
            tag_id: undefined,
            color: '#33ee00',
            dive_count: null,
            last_dive: null,
            text: null,
        };
        beforeEach(() => {
            component.tag = Object.assign({}, tag);
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
            const newTagValues = {
                tag_id: -2,
                color: '#fefefe',
                text: 'TestColor',
            };
            beforeEach(async () => {
                service.update.and.resolveTo(newTagValues);
                component.form.controls.color.setValue(newTagValues.color);
                component.form.controls.text.setValue(newTagValues.text);
                await component.submit();
            });

            it('Should call update service', () => {
                expect(service.update).toHaveBeenCalledWith({
                    tag_id: undefined,
                    text: newTagValues.text,
                    color: newTagValues.color,
                });
            });

            it('Should update tag', () => {
                expect(component.tag).toEqual(
                    jasmine.objectContaining({
                        text: newTagValues.text,
                        color: newTagValues.color,
                    }),
                );
            });

            it('should call onDataChanged', () => {
                expect(component.onDataChanged.emit).toHaveBeenCalledWith({
                    type: 'insert',
                    key: newTagValues.tag_id,
                });
            });
        });
    });

    describe('with existing tag', () => {
        const tag: ITagStat = {
            tag_id: -1,
            color: '#ff0000',
            dive_count: 5,
            last_dive: new Date('2019-12-12T12:12:12'),
            text: 'TestTag',
        };
        beforeEach(() => {
            component.tag = Object.assign({}, tag);
            fixture.detectChanges();
        });

        it('should fill form', () => {
            expect(component.form.value).toEqual({
                text: tag.text,
                color: tag.color,
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
                service.update.and.resolveTo(tag);
                await component.submit();
            });

            it('Should call service update', () => {
                expect(service.update).toHaveBeenCalled();
            });

            it('Should call detailcomponent reset', () => {
                expect(fakeDetailComponent.reset).toHaveBeenCalled();
            });

            it('Should hold new data', () => {
                expect(component.tag).toEqual(
                    jasmine.objectContaining({
                        color: '#0000ff',
                    }),
                );
            });

            it('should called onDatachange event', () => {
                expect(component.onDataChanged.emit).toHaveBeenCalledWith({
                    type: 'update',
                    key: tag.tag_id,
                });
            });
        });

        describe('Delete', () => {
            beforeEach(async () => {
                await component.delete();
            });

            it('should call delete service', async () => {
                expect(service.delete).toHaveBeenCalledWith(tag.tag_id);
            });

            it('should call back', async () => {
                expect(component.back).toHaveBeenCalled();
            });

            it('should called onDatachange event', () => {
                expect(component.onDataChanged.emit).toHaveBeenCalledWith({
                    type: 'delete',
                    key: tag.tag_id,
                });
            });
        });
    });
});
