import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DiveDetailComponent } from './dive-detail.component';
import { DiveService } from 'app/services/dive.service';
import { PlaceService } from 'app/services/place.service';
import { BuddyService } from 'app/services/buddy.service';
import { TagService } from 'app/services/tag.service';
import { ModalService } from 'app/services/modal.service';
import { FormBuilder } from '@angular/forms';
import { TagsComponent } from 'app/components/controls/tags/tags.component';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { BaseModalComponent } from 'app/components/modals/base/base-modal.component';

describe('DiveDetailComponent', () => {
    let component: DiveDetailComponent;
    let fixture: ComponentFixture<DiveDetailComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            imports: [HttpClientTestingModule],
            declarations: [
                DiveDetailComponent,
                TagsComponent,
                BaseModalComponent,
            ],
            providers: [
                DiveService,
                PlaceService,
                BuddyService,
                TagService,
                ModalService,
                FormBuilder,
            ],
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(DiveDetailComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
