import { Component, EventEmitter, Input, Output } from '@angular/core';

export interface ITag {
    id?: number;
    text: string;
    color: string;
}

@Component({
    selector: 'app-tags',
    templateUrl: './tags.component.html',
    styleUrls: ['./tags.component.scss'],
    providers: [],
})
export class TagsComponent {
    @Input() canremove = false;
    @Input() tags: ITag[] = [];
    @Output() onremove = new EventEmitter();
}
