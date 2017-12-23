import { ITag } from '../../controls/tags/tags.component';
import { DiveProfileComponent } from '../dive-profile/dive-profile.component';
import { Validators, FormBuilder, FormGroup, NgForm, FormControl } from '@angular/forms';
import { Observable } from 'rxjs/Rx';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { DiveService } from '../../../services/dive.service';
import { Dive, Duration, IPlace } from '../../../shared/dive';
import { SimpleChanges, OnInit, Component, Input, OnChanges, ViewChild, ElementRef, Output, EventEmitter } from '@angular/core';
import * as moment from 'moment';
import 'rxjs/add/operator/switchMap';
import { CustomValidators } from 'app/shared/validators';
import { BuddyService } from 'app/services/buddy.service';
import { markFormGroupTouched } from 'app/shared/common';
import { PlaceService } from 'app/services/place.service';
import { TagService } from 'app/services/tag.service';

declare function $(...args: any[]): any;

@Component({
    selector: 'app-dive-detail',
    templateUrl: './dive-detail.component.html',
    styleUrls: ['./dive-detail.component.scss']
})
export class DiveDetailComponent implements OnInit, OnChanges {
    @Input() dive: Dive;
    @Output() onDiveChanged = new EventEmitter<Dive>();

    public form: FormGroup;
    public CurrentDate: string = moment().format('DD-MM-YYYY HH:mm:ss');

    @ViewChild('diveProfile') public diveProfile: DiveProfileComponent;

    constructor(
        private diveService: DiveService,
        private placeService: PlaceService,
        private buddyService: BuddyService,
        private tagService: TagService,
        private _fb: FormBuilder,
        private hostElement: ElementRef,
        private route: Router,
    ) {
        this.form = this._fb.group({
            date: ['', [Validators.required, CustomValidators.datetime]],
            divetime: ['', [Validators.required, CustomValidators.duration]],
            maxDepth: ['', [Validators.required, CustomValidators.decimal]],
            place: this._fb.group({
                id: [''],
                name: [''],
                country: ['']
            }, {
                    validator: (g: FormGroup) => {
                        const name = g.controls.name.value || '';
                        const country = g.controls.country.value || '';

                        const isValid = name.length === 0 && country.length === 0
                            || name.length !== 0 && country.length !== 0;

                        return isValid ? null : { 'both-required': true };
                    }
                }),
            tank: this._fb.group({
                volume: ['', [Validators.required, CustomValidators.integer]],
                pressureStart: ['', [Validators.required, CustomValidators.decimal]],
                pressureEnd: ['', [Validators.required, CustomValidators.decimal]],
                pressureType: ['', [Validators.required, Validators.pattern(/bar|psi/)]],
                airPercentage: ['', [Validators.required, CustomValidators.integer]]
            }),
            buddies: [''],
            tags: ['']
        });
    }

    ngOnInit(): void {
        $(this.hostElement.nativeElement).on(
            'shown.bs.tab',
            'a[data-toggle="tab"][aria-controls="profile"]',
            () => {
                this.diveProfile.resize();
            },
        )
    }

    ngOnChanges(changes: SimpleChanges): void {
        this.reset();
    }

    onEnter(e: Event) {
        // prevent submit
        e.preventDefault();

        // tab on enter
        const hostEl = this.hostElement.nativeElement as HTMLElement;
        if (e.target instanceof HTMLInputElement) {
            e.target.blur();
            const all = hostEl.querySelectorAll('input');
            let iX: number;
            for (iX = 0; iX < all.length; iX++) {
                if (all.item(iX) === e.target) {
                    break;
                }
            }
            if (iX + 1 < all.length) {
                all.item(iX + 1).select();
            }
        }

    }

    public reset() {
        this.form.reset();
        if (this.dive) {
            this.form.setValue({
                date: this.dive.date ? moment(this.dive.date).format('DD-MM-YYYY HH:mm:ss') : '',
                divetime: this.dive.divetime ? this.dive.divetime.toString() : '',
                maxDepth: this.dive.maxDepth ? this.dive.maxDepth.toFixed(1) : '',
                place: this.dive.place ? {
                    id: this.dive.place.place_id || null,
                    name: this.dive.place.name || '',
                    country: this.dive.place.country_code || ''
                } : {
                        id: null,
                        name: null,
                        country: null,
                    },
                tank: {
                    volume: this.dive.tanks.length ? this.dive.tanks[0].volume : '',
                    airPercentage: this.dive.tanks.length ? this.dive.tanks[0].oxygen : '',
                    pressureStart: this.dive.tanks.length ? this.dive.tanks[0].pressure.begin : '',
                    pressureEnd: this.dive.tanks.length ? this.dive.tanks[0].pressure.end : '',
                    pressureType: this.dive.tanks.length ? this.dive.tanks[0].pressure.type : 'bar',
                },
                buddies: this.dive.buddies.map((b) => { return { id: b.buddy_id, text: b.text, color: b.color }; }),
                tags: this.dive.tags.map((b) => { return { id: b.tag_id, text: b.text, color: b.color }; }),
            });
        }
    }

    get diagnostic() {
        function getDirtyValues(cg: FormGroup) {
            const dirtyValues = {};  // initialize empty object
            Object.keys(cg.controls).forEach((c) => {

                const currentControl = cg.controls[c];

                if (currentControl.dirty) {
                    if ((<FormGroup>currentControl).controls) { // check for nested controlGroups
                        dirtyValues[c] = getDirtyValues(<FormGroup>currentControl);  // recursion for nested controlGroups
                    } else {
                        dirtyValues[c] = true;  // simple control
                    }
                }

            });
            return dirtyValues;
        }

        return {
            value: this.form.value,
            formDirty: this.form.dirty,
            dirty: getDirtyValues(this.form),
        };
    }

    diveSpotChanged(place: IPlace) {
        if (place === null || typeof (place) === 'string') {
            return;
        }

        const formGroup = (this.form.controls.place as FormGroup);

        formGroup.controls.name.setValue(place.name);
        formGroup.controls.id.setValue(place.place_id);
        if (place.country_code && !formGroup.controls.country.value) {
            formGroup.controls.country.setValue(place.country_code);
        }
        formGroup.markAsDirty();
    }

    diveCountryChanged(country: string) {
        const formGroup = (this.form.controls.place as FormGroup);

        formGroup.controls.country.setValue(country);
        formGroup.controls.country.markAsDirty();
    }

    async getCountries(keyword: string) {
        const cntries = await this.placeService.countries();
        const fuse = new Fuse(
            cntries, {
                threshold: 0.6,
                distance: 100,
                location: 0,
                shouldSort: true,
                maxPatternLength: 32,
                keys: [
                    { name: 'code', weight: 0.7 },
                    { name: 'description', weight: 0.3 },
                ]
            }
        );
        return fuse.search(keyword);
    }

    async getDivespots(keyword: string) {
        const c = (this.form.controls.place as FormGroup).controls.country.value;
        const spots = await this.placeService.list(c);

        if (!keyword) {
            return spots;
        }
        const fuse = new Fuse(
            spots, {
                threshold: 0.6,
                distance: 100,
                location: 0,
                shouldSort: true,
                maxPatternLength: 32,
                keys: [
                    'name',
                ]
            }
        );
        return fuse.search(keyword).slice(0, 10);
    }

    newDiveSpot(name: string): IPlace {
        const c = (<FormGroup>this.form.controls.place).controls.country.value;
        return {
            country_code: c,
            name: name
        };
    }

    async getBuddies(keyword: string) {
        const buds = await this.buddyService.list();

        const fuse = new Fuse(
            buds, {
                threshold: 0.6,
                distance: 100,
                location: 0,
                shouldSort: true,
                maxPatternLength: 32,
                keys: [
                    'text',
                ]
            }
        );
        const list = keyword ? fuse.search(keyword).slice(0, 10) : buds.slice(0, 10);
        return list.map((b) => {
            return {
                id: b.buddy_id,
                text: b.text,
                color: b.color,
            };
        });
    }

    async getTags(keyword: string) {
        const tags = await this.tagService.list();

        const fuse = new Fuse(
            tags, {
                threshold: 0.6,
                distance: 100,
                location: 0,
                shouldSort: true,
                maxPatternLength: 32,
                keys: [
                    'text',
                ]
            }
        );
        const list = keyword ? fuse.search(keyword).slice(0, 10) : tags.slice(0, 10);
        return list.map((b) => {
            return {
                id: b.tag_id,
                text: b.text,
                color: b.color,
            };
        });
    }

    onSubmit(e: Event) {
        e.preventDefault();
        markFormGroupTouched(this.form);
        if (!this.form.valid) {
            return;
        }

        const dat = this.form.value;
        const d = new Dive;
        d.id = this.dive.id;

        d.date = moment(dat.date, CustomValidators.DateTimeFormats, true).toDate();

        d.divetime = Duration.Parse(dat.divetime);
        d.maxDepth = Number(dat.maxDepth);

        if (dat.place.id || (dat.place.name && dat.place.country)) {
            d.place = {
                place_id: dat.place.id || undefined,
                name: dat.place.name || undefined,
                country_code: dat.place.country || undefined
            };
        }

        d.tanks = [{
            oxygen: dat.tank.airPercentage,
            volume: dat.tank.volume,
            pressure: {
                begin: dat.tank.pressureStart,
                end: dat.tank.pressureEnd,
                type: dat.tank.pressureType,
            }
        }];

        d.samples = this.dive.samples;
        d.tags = (dat.tags as ITag[]).map(
            (t) => {
                return {
                    tag_id: t.id,
                    text: t.text,
                    color: t.color,
                };
            }
        );
        d.buddies = (dat.buddies as ITag[]).map(
            (t) => {
                return {
                    buddy_id: t.id,
                    text: t.text,
                    color: t.color,
                };
            }
        );

        this.diveService.save(
            d.toJSON(),
            d.id
        ).then(
            (v) => {
                d.id = v.dive_id;
                this.onDiveChanged.emit(d);
            }
            ).catch(
            (e) => console.log('error', e)
            );

        this.dive = d;
        this.reset();
    }

    public back() {
        this.route.navigate(['dive']);
    }

    public async delete() {
        if (this.dive.isNew) {
            this.back();
        } else {
            await this.diveService.delete(this.dive.id);
            this.onDiveChanged.emit(undefined);
            this.back();
        }
    }

}
