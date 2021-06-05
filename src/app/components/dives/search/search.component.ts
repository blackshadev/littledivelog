import {
    Component,
    OnInit,
    EventEmitter,
    Output,
    TemplateRef,
    Input,
} from "@angular/core";
import { Observable } from "rxjs";
import { BuddyService } from "app/services/buddy.service";
import { TagService } from "app/services/tag.service";
import { PlaceService } from "app/services/place.service";
import { ValidatorFn, AbstractControl } from "@angular/forms";
import { CustomValidators } from "app/shared/validators";

interface ISearchItem {
    text: string;
    key: any;
}

interface ITopic {
    name: string;
    caption: string;
    source?: () => Promise<{ text: string; key: any }[]>;
    validate?: ValidatorFn;
}
export interface IFilter {
    name: string;
    caption: string;
    value: string;
    displayValue?: string;
}

@Component({
    selector: "app-dive-search",
    templateUrl: "./search.component.html",
    styleUrls: ["./search.component.scss"],
})
export class SearchComponent implements OnInit {
    @Input() extraButtons: TemplateRef<any>;

    @Output()
    public filterChanged: EventEmitter<IFilter[]> = new EventEmitter<
        IFilter[]
    >();

    public searchValue: any = "";
    public currentTopic: ITopic;
    public currentFilters: IFilter[] = [];

    public topics: ITopic[] = [];

    constructor(
        private buddyService: BuddyService,
        private tagService: TagService,
        private placeService: PlaceService,
    ) {
        this.topics = [
            {
                caption: "Date on",
                name: "dateOn",
                validate: CustomValidators.datetime,
            },
            {
                caption: "Date before",
                name: "dateFrom",
                validate: CustomValidators.datetime,
            },
            {
                caption: "Date After",
                name: "dateTill",
                validate: CustomValidators.datetime,
            },
            {
                caption: "With buddy",
                name: "buddy",
                source: async () => {
                    const buds = await this.buddyService.list();
                    return buds.map((b) => ({ text: b.text, key: b.buddy_id }));
                },
            },
            {
                caption: "With tag",
                name: "tag",
                source: async () => {
                    const tags = await this.tagService.list();
                    return tags.map((t) => ({ text: t.text, key: t.tag_id }));
                },
            },
            {
                caption: "On place",
                name: "place",
                source: async () => {
                    const plc = await this.placeService.list();
                    return plc.map((p) => ({ text: p.name, key: p.place_id }));
                },
            },
        ];
    }

    ngOnInit() {}

    public addSearch() {
        let value: string;
        let displayValue: string | undefined;
        if (typeof this.searchValue === "string") {
            value = this.searchValue;
        } else {
            value = this.searchValue.key;
            displayValue = this.searchValue.text;
        }

        this.currentFilters.push({
            name: this.currentTopic.name,
            caption: this.currentTopic.caption,
            value,
            displayValue,
        });

        this.filterChanged.emit(this.currentFilters);
    }

    public removeItem(item: IFilter) {
        const idx = this.currentFilters.indexOf(item);
        if (idx > -1) {
            this.currentFilters.splice(idx, 1);
        }

        this.filterChanged.emit(this.currentFilters);
    }

    public getSearchItems(v: string): Observable<ISearchItem[]> {
        return new Observable((obs) => {
            if (!(this.currentTopic && this.currentTopic.source)) {
                obs.next([]);
                obs.complete();
            } else {
                const prom = this.currentTopic.source();
                prom.then((items) => {
                    obs.next(items);
                    obs.complete();
                }).catch((err) => obs.error(err));
            }
        });
    }

    public validate(v: AbstractControl) {
        if (this.currentTopic && this.currentTopic.validate) {
            return this.currentTopic.validate(v);
        } else {
            return null;
        }
    }
}
