import { Subscription, SubscriptionLike } from 'rxjs';
import { Dive } from '../../shared/dive';
import {
    ActivatedRoute,
    Params,
    Router,
    RoutesRecognized,
} from '@angular/router';
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
import { filter, pairwise } from 'rxjs/operators';

@Component({
    selector: 'app-dives',
    templateUrl: './dives.component.html',
    styleUrls: ['./dives.component.scss'],
})
export class DivesComponent implements OnInit, OnDestroy {
    @Input()
    public mode: 'normal' | 'merge' = 'normal';

    public dive?: Dive;
    public dives: Dive[];

    private subs: SubscriptionLike[] = [];
    private filters: IFilter[] = [];

    @ViewChild('diveDetail')
    private diveDetail: DiveDetailComponent;
    private _lastWasDive = false;

    public get selectionMode(): boolean {
        return this.mode === 'merge';
    }

    constructor(
        private service: DiveService,
        private route: ActivatedRoute,
        private profile: ProfileService,
        private location: Location,
        private modal: ModalService,
    ) {
        this.refresh();
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
                .subscribe((dive) => {
                    this.dive = dive;
                }),
            this.location.subscribe((e) => {
                // TODO: use the router or something else
                if (e.url === '/dive') {
                    this.activateDive(undefined);
                }
            }),
        );
    }

    clickDive(d: Dive) {
        if (this.mode === 'merge') {
            this.toggleDive(d);
        }
        this.activateDive(d);
    }

    ngOnDestroy(): void {
        this.subs.forEach((s) => s.unsubscribe());
    }

    diveChanged(d: Dive) {
        this.refresh();
        if (this.dive.isNew || this.dive.id === d.id) {
            this.dive = d;
        }
    }

    goBack() {
        this.activateDive(undefined);
    }

    public toggleDive(d: Dive) {
        d.selected = !d.selected;
    }

    async activateDive(d?: Dive, forced: boolean = false) {
        if (this.dive?.id === d?.id) {
            return;
        }

        if (this.diveDetail.form.dirty && !forced) {
            // ask to save
            this.modal.open('dives-unsaved-changes', (shouldSave) => {
                if (shouldSave) {
                    const saved = this.diveDetail.save();
                    if (saved) {
                        this.activateDive(d, true);
                    } else {
                        // Save failed, ask to discard
                        this.modal.open(
                            'dives-unsaved-changes-invalid',
                            (shouldDiscard) => {
                                if (shouldDiscard) {
                                    this.activateDive(d, true);
                                }
                            },
                        );
                    }
                } else {
                    this.activateDive(d, true);
                }
            });

            return;
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
            this.dives.forEach((d) => (d.selected = false));
            this.mode = 'merge';
        } else if (this.mode === 'merge') {
            const selected = this.dives.filter((d) => d.selected && d.id);

            if (selected.length === 0) {
                this.mode = 'normal';
                return;
            }

            this.modal.open('merge', (b: boolean) => {
                if (!b) {
                    this.mode = 'normal';
                    return;
                }

                this.service
                    .merge(selected.map((d) => ({ dive_id: d.id! })))
                    .then(() => {
                        this.mode = 'normal';
                        this.refresh();
                    })
                    .catch((err) => {
                        const msg =
                            (err.error && err.error.error) || err.message;
                        this.modal.open('error', {
                            extra: {
                                message: msg,
                            },
                        });
                    });
            });
        }
    }

    refresh() {
        const o = this.extractListFilter(this.filters);

        this.service.list(o).then((d) => {
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

        if (equipment && equipment.tanks) {
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
