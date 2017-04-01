import { Component, OnInit, forwardRef, EventEmitter, Output, Input } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { Observable } from "rxjs/Rx";

interface ITag {
  text: string;
  color: string;
}

@Component({
  selector: 'app-tags',
  templateUrl: './tags.component.html',
  styleUrls: ['./tags.component.css'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => TagsComponent),
      multi: true
    }
  ]
})
export class TagsComponent implements OnInit, ControlValueAccessor {
  @Input() tags: ITag[];
  @Output() change = new EventEmitter<ITag[]>();
  @Output() touched = new EventEmitter<ITag[]>();

  private onChange: (v: string) => void = () => { };
  private onTouched: () => void = () => { };

  constructor() {
    this.tags = ([
      {
        text: 'Deco',
        color: '#ff0000'
      }, {
        text: 'Night',
        color: '#000000'
      }
    ]);
  }

  ngOnInit() {
  }

  writeValue(obj: any): void {
    // this.tags = obj;
  }
  registerOnChange(fn: any): void {
    this.onChange = fn;
  }
  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }
  setDisabledState(isDisabled: boolean): void {
    throw new Error('Method not implemented.');
  }

}
