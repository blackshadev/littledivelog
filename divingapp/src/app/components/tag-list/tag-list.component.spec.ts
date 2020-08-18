import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TagListComponent } from './tag-list.component';
import { TagService, ITagStat } from 'app/services/tag.service';
import { RouterTestingModule } from '@angular/router/testing';
import { ListDetailComponent } from '../controls/list-detail/list-detail.component';
import { TagComponent } from '../controls/tags/tag/tag.component';
import { TagDetailComponent } from './tag-detail/tag-detail.component';
import { HideWhenDirective } from 'app/directives/hide-when/hide-when.directive';
import { FormBuilder } from '@angular/forms';
import { By } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { HttpClientTestingModule } from '@angular/common/http/testing';

describe('TagListComponent', () => {
    let component: TagListComponent;
    let fixture: ComponentFixture<TagListComponent>;
    let fakeService: jasmine.SpyObj<TagService>;
    let navigateSpy: jasmine.Spy<(p: string) => void>;

    const allTags: ITagStat[] = [
        {
            tag_id: -1,
            color: '#ff0000',
            dive_count: 2,
            last_dive: new Date('2019-12-12T13:00:00'),
            text: 'tester',
        },
        {
            tag_id: -2,
            color: '#ccc',
            dive_count: 2,
            last_dive: new Date('2019-12-12T13:00:00'),
            text: 'ploep',
        },
    ];

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            imports: [
                RouterTestingModule.withRoutes([]),
                HttpClientTestingModule,
            ],
            declarations: [
                TagListComponent,
                ListDetailComponent,
                TagComponent,
                TagDetailComponent,
                HideWhenDirective,
            ],
            providers: [TagService, FormBuilder],
        }).compileComponents();
    }));

    beforeEach(() => {
        fakeService = spyOnAllFunctions(TestBed.get(TagService));
        fakeService.fullList.and.resolveTo(allTags);
        fixture = TestBed.createComponent(TagListComponent);
        navigateSpy = spyOn(TestBed.get(Router), 'navigateByUrl');
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should call TagService.FullList', () => {
        expect(fakeService.fullList).toHaveBeenCalled();
    });

    describe('with tags', () => {
        // TODO: instead of using promises in services use observables which
        //          makes this better testable
        beforeEach((done) => {
            setTimeout(() => {
                fixture.detectChanges();
                done();
            }, 10);
        });

        it('should have tags in view', () => {
            const elements = fixture.debugElement.queryAll(By.css('.badge'));

            expect(elements.length).toEqual(allTags.length);

            expect(
                elements.map((el) => el.nativeElement.textContent.trim()),
            ).toEqual(allTags.map((el) => el.text));
        });

        it('should select on row click', () => {
            const element = fixture.debugElement.query(
                By.css('tr[data-tag_id="-1"]'),
            );
            expect(element).toBeTruthy();

            const spy = spyOn(component, 'select');
            spy.and.callThrough();

            element.triggerEventHandler('click', {});
            expect(spy).toHaveBeenCalled();

            expect(component.selected).toEqual(allTags[0]);
        });

        it('should navigate on click', () => {
            const element = fixture.debugElement.query(
                By.css('tr[data-tag_id="-1"'),
            );
            expect(element).toBeTruthy();
            element.triggerEventHandler('click', {});

            expect(navigateSpy).toHaveBeenCalledWith('/tag/-1');
        });
    });
});
