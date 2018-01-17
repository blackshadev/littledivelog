import { Subscription } from 'rxjs/Rx';
import { Dive } from '../../shared/dive';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { DiveService, TFilterKeys } from '../../services/dive.service';
import { Component, OnDestroy, OnInit, ViewChild, ElementRef } from '@angular/core';
import { DiveDetailComponent } from 'app/components/dives/dive-detail/dive-detail.component';
import { AfterViewInit } from '@angular/core/src/metadata/lifecycle_hooks';
import { Location } from '@angular/common';
import { ProfileService } from 'app/services/profile.service';
import { IFilter } from 'app/components/dives/search/search.component';

@Component({
    selector: 'app-dives',
    templateUrl: './dives.component.html',
    styleUrls: ['./dives.component.scss']
})
export class DivesComponent implements OnInit, OnDestroy, AfterViewInit {

    public dive: Dive;
    public dives: Dive[];

    private subs: Subscription[] = [];
    private filters: IFilter[] = [];

    @ViewChild('diveDetail') private diveDetail: DiveDetailComponent;

    constructor(
        private service: DiveService,
        private route: ActivatedRoute,
        private profile: ProfileService,
        private location: Location,
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
            this.route.params.flatMap(
                async (params: Params) => {
                    if (params['id'] === 'new') {
                        return await this.newDive();
                    }
                    if (params['id'] === undefined) {
                        return undefined;
                    } else {
                        return await this.service.get(+params['id']);
                    }
                }).subscribe(
                    dive => this.dive = dive
                )
        );

    }

    ngOnDestroy(): void {
        this.subs.forEach((s) => s.unsubscribe());
    }

    diveChanged(d: Dive) {
        this.refresh();
        this.dive = d;
    }

    async selectDive(d?: Dive) {
        if (d === undefined) {
            this.dive = undefined;
            this.location.go('/dive');
        } else {
            this.dive = await this.service.get(d.id);
            this.location.go('/dive/' + d.id);
        }
    }

    refresh() {
        const o = this.extractListFilter(this.filters);

        this.service.list(o).then(
            (d) => {
                this.dives = d;
            }
        );
    }

    async gotoNewDive() {
        this.location.go('/dive/new');
        this.dive = await this.newDive();
    }

    protected  async newDive(): Promise<Dive> {
        const equipment = await this.profile.equipment();
        const dive = Dive.New();

        if (equipment.tanks) {
            dive.tanks = equipment.tanks;
        }

        return dive;
    }



    protected extractListFilter(filters: IFilter[]): {[k in TFilterKeys]?: string } {
        const o: {[k in TFilterKeys]?: any } = {};

        for (const flt of filters) {
            switch (flt.name) {
                case 'buddy':
                    o.buddies = o.buddies || []
                    o.buddies.push(flt.value);
                    break;
                case 'tag':
                    o.tags = o.tags || []
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
