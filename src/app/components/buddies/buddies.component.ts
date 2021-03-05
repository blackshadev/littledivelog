import {
    Component,
    OnInit,
    Input,
    OnDestroy,
    ViewChild,
    AfterViewInit,
} from '@angular/core';
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
    styleUrls: ['./buddies.component.scss'],
})
export class BuddiesComponent implements OnInit, OnDestroy {
    @Input()
    public selected?: IBuddyStat;
    public buddies: IBuddyStat[] = [];

    private _id?: number;
    private sub: Subscription;

    constructor(
        private buddyService: BuddyService,
        private router: Router,
        private route: ActivatedRoute,
    ) {
        this.refresh();
    }

    select(id?: number) {
        this.router.navigateByUrl(`/buddy/${id || ''}`);
        this._id = id;

        if (id === undefined) {
            this.selected = undefined;
        } else if (this.buddies) {
            this.selected = this.buddies.find((b) => this._id === b.buddy_id);
        }
    }

    ngOnInit() {
        this.sub = this.route.params.subscribe((params) => {
            const id = params['id'] !== undefined ? +params['id'] : undefined;
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
            } else if (id !== this._id) {
                this.select(id);
            }
        });
    }

    ngOnDestroy() {
        this.sub.unsubscribe();
    }

    async refresh() {
        const c = await this.buddyService.fullList();
        this.buddies = c;
        if (this._id !== undefined) {
            this.select(this._id);
        }
    }

    async dataChanged(ev: IDataChanged) {
        if (ev.type === 'delete') {
            this._id = undefined;
            this.selected = undefined;
        } else if (ev.type === 'insert') {
            this._id = ev.key;
        }
        await this.refresh();
        this.router.navigateByUrl(`/buddy/${ev.key}`);
    }
}
