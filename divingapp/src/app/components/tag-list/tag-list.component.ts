import { Component, OnInit, Input, OnDestroy, AfterViewInit, ViewChild } from '@angular/core';
import { Location } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { TagService, ITagStat } from 'app/services/tag.service';
import { TagDetailComponent } from 'app/components/tag-list/tag-detail/tag-detail.component';
import { IDataChanged } from 'app/shared/datachanged.interface';
import { TagsControlComponent } from 'app/components/controls/tags-control/tags-control.component';

@Component({
    selector: 'app-tag-list',
    templateUrl: './tag-list.component.html',
    styleUrls: ['./tag-list.component.scss']
})
export class TagListComponent implements OnInit, OnDestroy {

    @Input()
    public selected?: ITagStat;
    public tags: ITagStat[] = [];

    private _id?: number;
    private sub: Subscription

    constructor(
        private service: TagService,
        private router: Router,
        private route: ActivatedRoute,
    ) {
        this.refresh();
    }

    public rowClick(bud: ITagStat) {
        this.router.navigateByUrl(`/tag/${bud.tag_id}`)
    }

    ngOnInit() {
        this.sub = this.route.params.subscribe(params => {
            if (params['id'] === 'new') {
                this.selected = {
                    tag_id: undefined,
                    text: null,
                    color: TagsControlComponent.randomColor(),
                    last_dive: null,
                    dive_count: null,
                }
            } else {
                this.selectById(+params['id']);
            }
        });
    }

    ngOnDestroy() {
        this.sub.unsubscribe();
    }

    public async dataChanged(ev: IDataChanged) {
        if (ev.type === 'delete') {
            this._id = undefined;
            this.selected = undefined;
        } else if (ev.type === 'insert') {
            this._id = ev.key;
        }
        await this.refresh();
        this.router.navigateByUrl(`/tag/${ev.key}`);
    }

    public async refresh() {
        const c = await this.service.fullList();
        this.tags = c;
        if (this._id !== undefined) {
            this.selectById(this._id);
        }
    }

    protected selectById(id: number) {
        this._id = id;
        if (this.tags) {
            this.selected = this.tags.find((b) => this._id === b.tag_id);
        }
    }

}
