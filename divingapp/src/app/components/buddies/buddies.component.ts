import { Component, OnInit, Input, OnDestroy, ViewChild, AfterViewInit } from '@angular/core';
import { Location } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { IBuddyStat, BuddyService } from 'app/services/buddy.service';
import { Subscription } from 'rxjs';
import { BuddyDetailComponent } from 'app/components/buddies/buddy-detail/buddy-detail.component';
import { TagsControlComponent } from 'app/components/controls/tags-control/tags-control.component';
import { IDataChanged } from 'app/shared/datachanged.interface';

@Component({
    selector: 'app-buddies',
    templateUrl: './buddies.component.html',
    styleUrls: ['./buddies.component.scss']
})
export class BuddiesComponent implements OnInit, OnDestroy {
    @Input()
    public selected?: IBuddyStat;
    public buddies: IBuddyStat[] = [];

    @ViewChild('detail') private detail: BuddyDetailComponent;
    private _id?: number;
    private sub: Subscription

    constructor(
        private buddyService: BuddyService,
        private router: Router,
        private route: ActivatedRoute,
    ) {
        this.refresh();
    }

    public rowClick(bud: IBuddyStat) {
        this.router.navigateByUrl(`/buddy/${bud.buddy_id}`)
    }

    ngOnInit() {
        this.sub = this.route.params.subscribe(params => {
            if (params['id'] === 'new') {
                this.selected = {
                    buddy_id: undefined,
                    color: TagsControlComponent.randomColor(),
                    email: null,
                    text: null,
                    dive_count: null,
                    last_dive: null,
                    buddy_user_id: null,
                };
            } else {
                this.selectById(+params['id']);
            }
        });
    }

    ngOnDestroy() {
        this.sub.unsubscribe();
    }

    public async refresh() {
        const c = await this.buddyService.summarize()
        this.buddies = c;
        if (this._id !== undefined) {
            this.selectById(this._id);
        }
    }

    public async dataChanged(ev: IDataChanged) {
        if (ev.type === 'delete') {
            this._id = undefined;
            this.selected = undefined;
        } else if (ev.type === 'insert') {
            this._id = ev.key;
        }
        await this.refresh();
        this.router.navigateByUrl(`/buddy/${ev.key}`);
    }

    protected selectById(id: number) {
        this._id = id;
        if (this.buddies) {
            this.selected = this.buddies.find((b) => this._id === b.buddy_id);
        }
    }

}
