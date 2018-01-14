import { Component, OnInit } from '@angular/core';

interface ITopic {
    name: string;
    caption: string;
    source?: () => { text: string, key: string }
}

@Component({
    selector: 'app-dive-search',
    templateUrl: './search.component.html',
    styleUrls: ['./search.component.scss']
})
export class SearchComponent implements OnInit {

    public currentTopic: ITopic;

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

    constructor() { }

    ngOnInit() {
    }

}
