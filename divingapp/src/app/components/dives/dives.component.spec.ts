import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DivesComponent } from './dives.component';
import { DiveService } from 'app/services/dive.service';
import { ProfileService } from 'app/services/profile.service';
import { ModalService } from 'app/services/modal.service';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { BuddyService } from 'app/services/buddy.service';
import { TagService } from 'app/services/tag.service';
import { ListDetailComponent } from '../controls/list-detail/list-detail.component';
import { BaseModalComponent } from '../modals/base/base-modal.component';
import { DiveDetailComponent } from './dive-detail/dive-detail.component';
import { SearchComponent } from './search/search.component';
import { HideWhenDirective } from 'app/directives/hide-when/hide-when.directive';
import { PlaceService } from 'app/services/place.service';
import { FormBuilder, FormsModule } from '@angular/forms';
import { NguiAutoCompleteModule } from '@ngui/auto-complete';
import { ValidateFunctionDirective } from 'app/directives/validate-function/validate-function.directive';

describe('DivesComponent', () => {
    let component: DivesComponent;
    let fixture: ComponentFixture<DivesComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            imports: [
                HttpClientTestingModule,
                RouterTestingModule.withRoutes([]),
                FormsModule,
                NguiAutoCompleteModule,
            ],
            declarations: [
                DivesComponent,
                ListDetailComponent,
                BaseModalComponent,
                DiveDetailComponent,
                SearchComponent,
                HideWhenDirective,
                ValidateFunctionDirective,
            ],
            providers: [
                DiveService,
                ProfileService,
                ModalService,
                BuddyService,
                TagService,
                PlaceService,
                FormBuilder,
            ],
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(DivesComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
