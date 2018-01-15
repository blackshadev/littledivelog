import { Component, OnInit } from '@angular/core';

interface ITopic {
    name: string;
    caption: string;
    source?: () => { text: string, key: string }
}
interface IItem {
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
    public items: IItem[] = [];

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
        this.items.push({
            name: this.currentTopic.name,
            caption: this.currentTopic.caption,
            value: this.searchValue,
        });
    }

    public removeItem(item: IItem) {
        const idx = this.items.indexOf(item);
        if (idx > -1) {
            this.items.splice(idx, 1)
        }
    }

}
