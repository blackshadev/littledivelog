import { Subscription } from 'rxjs';
import { Dive } from '../../shared/dive';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { DiveService, TFilterKeys } from '../../services/dive.service';
import {
    Component,
    OnDestroy,
    OnInit,
    ViewChild,
    ElementRef,
    AfterViewInit,
    Input,
} from '@angular/core';
import { DiveDetailComponent } from 'app/components/dives/dive-detail/dive-detail.component';
import { Location } from '@angular/common';
import { ProfileService } from 'app/services/profile.service';
import { IFilter } from 'app/components/dives/search/search.component';
import { flatMap } from 'rxjs/operators';
import { ModalService } from '../../services/modal.service';

@Component({
    selector: 'app-dives',
    templateUrl: './dives.component.html',
    styleUrls: ['./dives.component.scss'],
})
export class DivesComponent implements OnInit, OnDestroy, AfterViewInit {
    public get selectionMode(): boolean {
        return this.mode === 'merge';
    }
    @Input()
    public mode: 'normal' | 'merge' = 'normal';

    public dive: Dive;
    public dives: Dive[];

    private subs: Subscription[] = [];
    private filters: IFilter[] = [];

    @ViewChild('diveDetail', { static: false })
    private diveDetail: DiveDetailComponent;
    private _selected: Set<number> = new Set<number>();

    constructor(
        private service: DiveService,
        private route: ActivatedRoute,
        private profile: ProfileService,
        private location: Location,
        private modal: ModalService,
    ) {
        this.refresh();
    }

    ngAfterViewInit() {
        // replace default back behaviour to prevent a reload
        this.diveDetail.back = () => {
            this.dive = undefined;
            this.location.go('/dive');
        };
    }

    ngOnInit(): void {
        this.subs.push(
            this.route.params
                .pipe(
                    flatMap(async (params: Params) => {
                        if (params['id'] === 'new') {
                            return await this.newDive();
                        }
                        if (params['id'] === undefined) {
                            return undefined;
                        } else {
                            return await this.service.get(+params['id']);
                        }
                    }),
                )
                .subscribe(dive => (this.dive = dive)),
        );
    }

    clickDive(d: Dive) {
        if (this.mode === 'merge') {
            this.toggleDive(d);
        }
        this.activateDive(d);
    }

    ngOnDestroy(): void {
        this.subs.forEach(s => s.unsubscribe());
    }

    diveChanged(d: Dive) {
        this.refresh();
        this.dive = d;
    }

    public toggleDive(d: Dive) {
        if (this.isSelected(d)) {
            this.deselectDive(d);
        } else {
            this.selectDive(d);
        }
    }

    public selectDive(d: Dive) {
        if (d.id === undefined) {
            return;
        }
        this._selected.add(d.id);
    }

    public deselectDive(d: Dive) {
        if (d.id === undefined) {
            return;
        }
        this._selected.delete(d.id);
    }

    public isSelected(d: Dive): boolean {
        if (d.id === undefined) {
            return false;
        }
        return this._selected.has(d.id);
    }

    async activateDive(d?: Dive, forced: boolean = false) {
        if (this.diveDetail.form.dirty) {
            if (!(await this.diveDetail.save()) && !forced) {
                this.modal.open('sure', accepted => {
                    if (accepted) {
                        this.activateDive(d, true);
                    }
                });
                return;
            }
        }

        if (d === undefined) {
            this.dive = undefined;
            this.location.go('/dive');
        } else {
            this.dive = await this.service.get(d.id);
            this.location.go('/dive/' + d.id);
        }
    }

    toggleMerge() {
        if (this.mode === 'normal') {
            this.mode = 'merge';
        } else if (this.mode === 'merge') {
            console.log();
        }
    }

    refresh() {
        const o = this.extractListFilter(this.filters);

        this.service.list(o).then(d => {
            this.dives = d;
        });
    }

    async gotoNewDive() {
        this.location.go('/dive/new');
        this.dive = await this.newDive();
    }

    protected async newDive(): Promise<Dive> {
        const equipment = await this.profile.equipment();
        const dive = Dive.New();

        if (equipment.tanks) {
            dive.tanks = equipment.tanks;
        }

        return dive;
    }

    protected extractListFilter(
        filters: IFilter[],
    ): { [k in TFilterKeys]?: string } {
        const o: { [k in TFilterKeys]?: any } = {};

        for (const flt of filters) {
            switch (flt.name) {
                case 'buddy':
                    o.buddies = o.buddies || [];
                    o.buddies.push(flt.value);
                    break;
                case 'tag':
                    o.tags = o.tags || [];
                    o.tags.push(flt.value);
                    break;
                case 'place':
                    o.place = flt.value;
                    break;
                case 'dateTill':
                    o.till = flt.value;
                    break;
                case 'dateFrom':
                    o.till = flt.value;
                    break;
                case 'dateOn':
                    o.date = flt.value;
                    break;
            }
        }

        return o;
    }
}
