import { leftpad } from '../../../shared/formatters';
import { Component, ElementRef, EventEmitter, forwardRef, Input, OnInit, Output, ViewChild } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { Observable } from 'rxjs/Rx';

interface ITag {
  text: string;
  color: string;
}

@Component({
  selector: 'app-tags-control',
  templateUrl: './tags-control.component.html',
  styleUrls: ['./tags-control.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => TagsControlComponent),
      multi: true
    }
  ]
})
export class TagsControlComponent implements OnInit, ControlValueAccessor {
  @Input() source: Observable<ITag[]>;
  @Input() tags: ITag[];

  @Output() change = new EventEmitter<ITag[]>();
  @Output() touched = new EventEmitter<ITag[]>();

  @ViewChild('tagInput')
  private tagInput: ElementRef;
  private onChange: (v: ITag[]) => void = () => { };
  private onTouched: () => void = () => { };

  constructor() {
    this.tags = ([
      {
        text: 'Deco',
        color: '#ff0000'
      }, {
        text: 'Night',
        color: '#000000'
      }, {
        text: 'Club',
        color: '#cccccc'
      }
    ]);
  }

  ngOnInit() {
  }

  private fontColor(color: string) {
    if (color[0] === '#') {
      color = color.substr(1);
    }
    const r = parseInt(color.substr(0, 2), 16);
    const g = parseInt(color.substr(2, 2), 16);
    const b = parseInt(color.substr(4, 2), 16);
    const yiq = ((r * 299) + (g * 587) + (b * 114)) / 1000;
    return (yiq >= 128) ? 'black' : 'white';
  }

  private randomColor() {
    const r = leftpad(2, Math.floor(Math.random() * 255).toString(16));
    const g = leftpad(2, Math.floor(Math.random() * 255).toString(16));
    const b = leftpad(2, Math.floor(Math.random() * 255).toString(16));
    return `#${r}${g}${b}`;
  }

  private addTag(v: ITag) {
    this.tags.push(v);
    const el = this.tagInput.nativeElement as HTMLInputElement;
    el.value = '';
    this.doChange();
    this.doTouched();
  }

  private removeTag(iX: number) {
    this.tags.splice(iX, 1);
    this.doChange();
    this.doTouched();
  }

  private doChange() {
    this.onChange(this.tags);
    this.change.emit(this.tags);
  }

  private doTouched() {
    this.onTouched();
    this.touched.emit();
  }

  writeValue(obj: any): void {
    this.tags = obj;
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
