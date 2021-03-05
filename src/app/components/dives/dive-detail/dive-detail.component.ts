import { ITag } from '../../controls/tags/tags.component';
import { DiveProfileComponent } from '../dive-profile/dive-profile.component';
import { Validators, FormBuilder, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { DiveService } from '../../../services/dive.service';
import { Dive, Duration, IPlace, IBuddy } from '../../../shared/dive';
import {
    OnInit,
    Component,
    Input,
    ViewChild,
    ElementRef,
    Output,
    EventEmitter,
} from '@angular/core';
import * as moment from 'moment';
import { CustomValidators } from 'app/shared/validators';
import { BuddyService } from 'app/services/buddy.service';
import { markFormGroupTouched } from 'app/shared/common';
import { PlaceService } from 'app/services/place.service';
import { TagService } from 'app/services/tag.service';
import { DetailComponentComponent } from 'app/components/controls/detail-component/detail-component.component';
import { ModalService } from 'app/services/modal.service';

@Component({
    selector: 'app-dive-detail',
    templateUrl: './dive-detail.component.html',
    styleUrls: ['./dive-detail.component.scss'],
})
export class DiveDetailComponent implements OnInit {
    public diveFormData: any;

    @Output() onDiveChanged = new EventEmitter<Dive>();
    @Output() onBack = new EventEmitter<void>();

    public form: FormGroup;
    public CurrentDate: string = moment().format('YYYY-MM-DD HH:mm:ss');

    @ViewChild('diveProfile')
    public diveProfile: DiveProfileComponent;
    @ViewChild('detailComponent')
    public detailComponent: DetailComponentComponent;
    private _dive: Dive;

    @Input()
    public set dive(d: Dive) {
        this._dive = d;
        this.updDiveFormData();
    }
    public get dive(): Dive {
        return this._dive;
    }

    constructor(
        private diveService: DiveService,
        private placeService: PlaceService,
        private buddyService: BuddyService,
        private tagService: TagService,
        private modalService: ModalService,
        private _fb: FormBuilder,
        private hostElement: ElementRef,
    ) {
        this.form = this._fb.group({
            date: ['', [Validators.required, CustomValidators.datetime]],
            divetime: ['', [Validators.required, CustomValidators.duration]],
            maxDepth: ['', [Validators.required, CustomValidators.decimal]],
            place: this._fb.group(
                {
                    id: [''],
                    name: [''],
                    country: [''],
                },
                {
                    validator: (g: FormGroup) => {
                        const name = g.controls.name.value || '';
                        const country = g.controls.country.value || '';

                        const isValid =
                            (name.length === 0 && country.length === 0) ||
                            (name.length !== 0 && country.length !== 0);

                        return isValid ? null : { 'both-required': true };
                    },
                },
            ),
            tank: this._fb.group({
                volume: ['', [Validators.required, CustomValidators.integer]],
                pressureStart: [
                    '',
                    [Validators.required, CustomValidators.decimal],
                ],
                pressureEnd: [
                    '',
                    [Validators.required, CustomValidators.decimal],
                ],
                pressureType: [
                    '',
                    [Validators.required, Validators.pattern(/bar|psi/)],
                ],
                airPercentage: [
                    '',
                    [Validators.required, CustomValidators.integer],
                ],
            }),
            buddies: [''],
            tags: [''],
        });
    }

    ngOnInit(): void {
        $(this.hostElement.nativeElement).on(
            'shown.bs.tab',
            'a[data-toggle="tab"][aria-controls="Profile"]',
            () => {
                this.diveProfile.resize();
            },
        );
    }

    public updDiveFormData() {
        if (!this.dive) {
            return {};
        }

        this.diveFormData = {
            date: this.dive.date
                ? moment(this.dive.date).format('YYYY-MM-DD HH:mm:ss')
                : '',
            divetime: this.dive.divetime ? this.dive.divetime.toString() : '',
            maxDepth: this.dive.maxDepth ? this.dive.maxDepth.toFixed(1) : '',
            place: this.dive.place
                ? {
                      id: this.dive.place.place_id || null,
                      name: this.dive.place.name || '',
                      country: this.dive.place.country_code || '',
                  }
                : {
                      id: null,
                      name: null,
                      country: null,
                  },
            tank: {
                volume: this.dive.tanks.length ? this.dive.tanks[0].volume : '',
                airPercentage: this.dive.tanks.length
                    ? this.dive.tanks[0].oxygen
                    : '',
                pressureStart: this.dive.tanks.length
                    ? this.dive.tanks[0].pressure.begin
                    : '',
                pressureEnd: this.dive.tanks.length
                    ? this.dive.tanks[0].pressure.end
                    : '',
                pressureType: this.dive.tanks.length
                    ? this.dive.tanks[0].pressure.type
                    : 'bar',
            },
            buddies: this.dive.buddies.map((b) => {
                return { buddy_id: b.buddy_id, text: b.text, color: b.color };
            }),
            tags: this.dive.tags.map((b) => {
                return { tag_id: b.tag_id, text: b.text, color: b.color };
            }),
        };
    }

    diveSpotChanged(place: IPlace) {
        if (place === null || typeof place === 'string') {
            return;
        }

        const formGroup = this.form.controls.place as FormGroup;

        formGroup.controls.name.setValue(place.name);
        formGroup.controls.id.setValue(place.place_id);
        if (place.country_code && !formGroup.controls.country.value) {
            formGroup.controls.country.setValue(place.country_code);
        }
        formGroup.markAsDirty();
    }

    diveCountryChanged(country: string) {
        const formGroup = this.form.controls.place as FormGroup;

        formGroup.controls.country.setValue(country);
        formGroup.controls.country.markAsDirty();
    }

    async getCountries(keyword: string) {
        const cntries = await this.placeService.countries();
        const fuse = new Fuse(cntries, {
            threshold: 0.2,
            distance: 100,
            location: 0,
            tokenize: true,
            shouldSort: true,
            maxPatternLength: 32,
            keys: [
                { name: 'code', weight: 0.7 },
                { name: 'description', weight: 0.3 },
            ],
        });
        const result = fuse.search(keyword).map((item) => item.item);
        return result;
    }

    async getDivespots(keyword: string) {
        const c = (this.form.controls.place as FormGroup).controls.country
            .value;
        const spots = await this.placeService.list(c);

        if (!keyword) {
            return spots;
        }
        const fuse = new Fuse(spots, {
            threshold: 0.6,
            distance: 100,
            location: 0,
            shouldSort: true,
            maxPatternLength: 32,
            keys: ['name'],
        });
        return fuse.search(keyword).slice(0, 10);
    }

    newDiveSpot(name: string): IPlace {
        const c = (<FormGroup>this.form.controls.place).controls.country.value;
        return {
            country_code: c,
            name: name,
        };
    }

    async getBuddies(keyword: string): Promise<IBuddy[]> {
        const buds = await this.buddyService.list();

        const fuse = new Fuse(buds, {
            threshold: 0.2,
            distance: 100,
            location: 0,
            shouldSort: true,
            maxPatternLength: 32,
            keys: ['text'],
        });
        const list = keyword
            ? fuse
                  .search(keyword)
                  .slice(0, 10)
                  .map((i) => i.item)
            : buds.slice(0, 10);
        return list.map((b) => {
            return {
                buddy_id: b.buddy_id,
                text: b.text,
                color: b.color,
            };
        });
    }

    async getTags(keyword: string): Promise<ITag[]> {
        const tags = await this.tagService.list();

        const fuse = new Fuse(tags, {
            threshold: 0.6,
            distance: 100,
            location: 0,
            shouldSort: true,
            maxPatternLength: 32,
            keys: ['text'],
        });
        const list = keyword
            ? fuse
                  .search(keyword)
                  .slice(0, 10)
                  .map((i) => i.item)
            : tags.slice(0, 10);
        return list.map((b) => {
            return {
                tag_id: b.tag_id,
                text: b.text,
                color: b.color,
            };
        });
    }

    public async onSubmit(e: Event) {
        e.preventDefault();
        await this.save();
    }

    public async save(): Promise<boolean> {
        markFormGroupTouched(this.form);
        if (!this.form.valid) {
            return false;
        }

        const dat = this.form.value;
        const d = new Dive();
        d.id = this.dive.id;

        d.date = moment(
            dat.date,
            CustomValidators.DateTimeFormats,
            true,
        ).toDate();

        d.divetime = Duration.Parse(dat.divetime);
        d.maxDepth = Number(dat.maxDepth);

        if (dat.place.id || (dat.place.name && dat.place.country)) {
            d.place = {
                place_id: dat.place.id || undefined,
                name: dat.place.name || undefined,
                country_code: dat.place.country || undefined,
            };
        }

        d.tanks = [
            {
                oxygen: dat.tank.airPercentage,
                volume: dat.tank.volume,
                pressure: {
                    begin: dat.tank.pressureStart,
                    end: dat.tank.pressureEnd,
                    type: dat.tank.pressureType,
                },
            },
        ];

        d.samples = this.dive.samples;
        d.tags = (dat.tags as ITag[]).map((t) => {
            return {
                tag_id: t.tag_id,
                text: t.text,
                color: t.color,
            };
        });
        d.buddies = (dat.buddies as IBuddy[]).map((t) => {
            return {
                buddy_id: t.buddy_id,
                text: t.text,
                color: t.color,
            };
        });

        const resp = await this.diveService.save(d.toJSON(), d.id);
        this.dive = await this.diveService.get(resp.dive_id);

        this.onDiveChanged.emit(this.dive);
        return true;
    }

    public goBack(forced: boolean = false) {
        // Check if the form has changes, if so ask for confirmation
        if (!forced && this.detailComponent.form.dirty) {
            this.modalService.open('dive-detail-unsaved-changes', (b) => {
                if (b) {
                    this.goBack(true);
                }
            });
        } else {
            this.form.reset();
            this.onBack.emit();
        }
    }

    public async delete() {
        if (this.dive.isNew) {
            this.goBack(true);
        } else {
            await this.diveService.delete(this.dive.id);
            this.onDiveChanged.emit(undefined);
            this.goBack(true);
        }
    }
}
