import { Component, OnInit, Input, OnDestroy } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { Subscription } from "rxjs";
import { TagService, ITagStat } from "app/services/tag.service";
import { IDataChanged } from "app/shared/datachanged.interface";
import { TagsControlComponent } from "app/components/controls/tags-control/tags-control.component";

@Component({
    selector: "app-tag-list",
    templateUrl: "./tag-list.component.html",
    styleUrls: ["./tag-list.component.scss"],
})
export class TagListComponent implements OnInit, OnDestroy {
    @Input()
    public selected?: ITagStat;
    public tags: ITagStat[] = [];

    private _id?: number;
    private sub: Subscription;

    constructor(
        private service: TagService,
        private router: Router,
        private route: ActivatedRoute,
    ) {
        this.refresh();
    }

    ngOnInit() {
        this.sub = this.route.params.subscribe((params) => {
            const id = params["id"] !== undefined ? +params["id"] : undefined;
            if (params["id"] === "new") {
                this.selected = {
                    tag_id: undefined,
                    text: null,
                    color: TagsControlComponent.randomColor(),
                    last_dive: null,
                    dive_count: null,
                };
            } else if (id !== this._id) {
                this.select(id);
            }
        });
    }

    ngOnDestroy() {
        this.sub.unsubscribe();
    }

    public async dataChanged(ev: IDataChanged) {
        if (ev.type === "delete") {
            this._id = undefined;
            this.selected = undefined;
        } else if (ev.type === "insert") {
            this._id = ev.key;
        }
        await this.refresh();
        this.router.navigateByUrl(`/tag/${ev.key}`);
    }

    async refresh() {
        const c = await this.service.fullList();
        this.tags = c;
        if (this._id !== undefined) {
            this.select(this._id);
        }
    }

    select(id?: number) {
        this.router.navigateByUrl(`/tag/${id || ""}`);
        this._id = id;

        if (id === undefined) {
            this.selected = undefined;
        } else if (this.tags) {
            this.selected = this.tags.find((b) => this._id === b.tag_id);
        }
    }
}
