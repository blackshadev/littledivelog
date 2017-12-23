import { leftpad } from '../../../shared/formatters';
import { Component, ElementRef, EventEmitter, forwardRef, Input, OnInit, Output, ViewChild } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { Observable } from 'rxjs/Rx';

export interface ITag {
    id?: number;
    text: string;
    color: string;
}

@Component({
    selector: 'app-tags',
    templateUrl: './tags.component.html',
    styleUrls: ['./tags.component.scss'],
    providers: []
})
export class TagsComponent {
    @Input() canremove = false;
    @Input() tags: ITag[] = [];
    @Output() onremove = new EventEmitter();

}
