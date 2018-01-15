import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { BehaviorSubject } from 'rxjs';

interface ISearchItem {
    text: string, key: string
}

interface ITopic {
    name: string;
    caption: string;
    source?: () => Promise<{ text: string, key: string }[]>
}
interface IFilter {
    name: string;
    caption: string;
    value: string;
}

@Component({
    selector: 'app-dive-search',
    templateUrl: './search.component.html',
    styleUrls: ['./search.component.scss']
})
export class SearchComponent implements OnInit {

    public searchValue = '';
    public currentTopic: ITopic;
    public currentFilters: IFilter[] = [];

    public topics: ITopic[] = [
        {
            caption: 'Date on',
            name: 'dateOn',
        }, {
            caption: 'Date before',
            name: 'dateFrom',
        }, {
            caption: 'Date After',
            name: 'dateTill',
        }, {
            caption: 'With buddy',
            name: 'buddies',
        }, {
            caption: 'With tag',
            name: 'tags',
        }, {
            caption: 'On place',
            name: 'place',
        },
    ];
    private topicMap: { [name: string]: ITopic };

    constructor() {
        const o: { [name: string]: ITopic } = {};
        for (const t of this.topics) {
            o[t.name] = t;
        }
        this.topicMap = o;
    }

    ngOnInit() {
    }

    public addSearch() {
        this.currentFilters.push({
            name: this.currentTopic.name,
            caption: this.currentTopic.caption,
            value: this.searchValue,
        });
    }

    public removeItem(item: IFilter) {
        const idx = this.currentFilters.indexOf(item);
        if (idx > -1) {
            this.currentFilters.splice(idx, 1)
        }
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

}
