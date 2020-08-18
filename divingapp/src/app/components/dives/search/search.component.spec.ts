import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SearchComponent } from './search.component';
import { BuddyService } from 'app/services/buddy.service';
import { PlaceService } from 'app/services/place.service';
import { TagService } from 'app/services/tag.service';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { FormsModule } from '@angular/forms';
import { BrowserModule, By } from '@angular/platform-browser';
import { ValidateFunctionDirective } from 'app/directives/validate-function/validate-function.directive';
import { NguiAutoCompleteModule } from '@ngui/auto-complete';
import { IBuddy } from 'app/shared/dive';

describe('SearchComponent', () => {
    let component: SearchComponent;
    let fixture: ComponentFixture<SearchComponent>;
    let buddyService: jasmine.SpyObj<BuddyService>;
    let tagService: jasmine.SpyObj<TagService>;
    let placeService: jasmine.SpyObj<PlaceService>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            imports: [
                HttpClientTestingModule,
                FormsModule,
                NguiAutoCompleteModule,
            ],
            declarations: [SearchComponent, ValidateFunctionDirective],
            providers: [BuddyService, PlaceService, TagService],
        }).compileComponents();
    }));

    beforeEach(() => {
        buddyService = spyOnAllFunctions(TestBed.get(BuddyService));
        tagService = spyOnAllFunctions(TestBed.get(TagService));
        placeService = spyOnAllFunctions(TestBed.get(PlaceService));

        fixture = TestBed.createComponent(SearchComponent);
        component = fixture.componentInstance;
        spyOn(component.filterChanged, 'emit');
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should show autocomplete for topic', () => {
        component.currentTopic = component.topics.find(
            (t) => t.name === 'buddy',
        );
        const element = fixture.debugElement.query(
            By.css('div[data-test-name="search-input"].autocomplete'),
        );
        expect(element).toBeDefined();
    });

    it('should show non-autocomplete for topic', () => {
        component.currentTopic = component.topics.find(
            (t) => t.name === 'dateOn',
        );
        const element = fixture.debugElement.query(
            By.css('div[data-test-name="search-input"].plain'),
        );
        expect(element).toBeDefined();
    });

    describe('Non autocomplete search topic', () => {
        beforeEach(() => {
            component.currentTopic = component.topics.find(
                (t) => t.name === 'dateOn',
            );

            component.searchValue = '2021-12-12';
            component.addSearch();
        });

        it('Should add search', () => {
            expect(component.currentFilters).toContain(
                jasmine.objectContaining({
                    name: 'dateOn',
                    value: '2021-12-12',
                }),
            );
        });

        it('Should call filter changes', () => {
            expect(component.filterChanged.emit).toHaveBeenCalled();
        });
    });

    describe('Autocomplete search topic', () => {
        beforeEach(async () => {
            component.currentTopic = component.topics.find(
                (t) => t.name === 'buddy',
            );

            component.searchValue = 'test';
        });

        it('Observable source', (done) => {
            const data = [
                {
                    buddy_id: -1,
                    text: 'test',
                    color: '#ff0000',
                },
            ] as IBuddy[];
            buddyService.list.and.resolveTo(data);
            component.getSearchItems('test').subscribe((v) => {
                expect(v).toContain({ key: -1, text: 'test' });
                expect(buddyService.list).toHaveBeenCalled();
                done();
            });
        });
    });
});
