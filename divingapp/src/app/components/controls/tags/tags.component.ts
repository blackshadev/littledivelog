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

  public fontColor(color: string) {
    if (color[0] === '#') {
      color = color.substr(1);
    }
    const r = parseInt(color.substr(0, 2), 16);
    const g = parseInt(color.substr(2, 2), 16);
    const b = parseInt(color.substr(4, 2), 16);
    const yiq = ((r * 299) + (g * 587) + (b * 114)) / 1000;
    return (yiq >= 128) ? 'black' : 'white';
  }
}
