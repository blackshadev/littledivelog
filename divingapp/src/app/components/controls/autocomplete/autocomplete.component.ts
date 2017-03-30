import { Component, OnInit, Input, HostBinding, forwardRef, EventEmitter, Output, HostListener, ElementRef, ViewChild } from '@angular/core';
import { NG_VALUE_ACCESSOR, ControlValueAccessor } from '@angular/forms';
import { Observable } from 'rxjs/Rx';

interface IItem {
  key: any;
  value: any;
  isNew: boolean;
}

type SourceFunction = (keyword: string) => Promise<any[]>;

@Component({
  selector: 'app-autocomplete',
  templateUrl: './autocomplete.component.html',
  styleUrls: ['./autocomplete.component.css'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => AutocompleteComponent),
      multi: true
    }
  ]
})
export class AutocompleteComponent implements OnInit, ControlValueAccessor {
  @Output() changed = new EventEmitter<any>();

  @Input() inputClass: string;
  @Input() set source(v: SourceFunction) {
    if (!(v instanceof Function)) {
      throw new Error('Expected source to be a async function');
    }
    this._source = v;
  }

  // tslint:disable-next-line:no-input-rename
  @Input('display-item') set displayItem(v: string) {
    this._displayItem = v;
    this.updateGetItem();
  }
  // tslint:disable-next-line:no-input-rename
  @Input('key-item') set keyItem(v: any) {
    this._keyItem = v;
    this.updateGetItem();
  }

  @Input() set value(v: any) {
    const eInput = this.inputElement.nativeElement as HTMLInputElement;
    eInput.value = v || '';

    if (this._value === v) {
      return;
    }

    this._value = v;
    this.changed.emit(v);
    this.onChange(v);
    this.onTouched();
  }
  get value(): any {
    return this._value;
  }

  @Input() disabled = false;
  @Input() placeholder: string;
  @Input() forceSelection = false;

  private _source: SourceFunction;
  private _value: any;
  private _displayItem: string;
  private _keyItem: string;
  private _selectedValue: IItem;
  private _items: IItem[] = [];
  @ViewChild('input') private inputElement: ElementRef;

  private getItem: (isNew: boolean, v: any) => IItem;
  private onChange: (v: string) => void = () => { };
  private onTouched: () => void = () => { };

  constructor() {
    this.updateGetItem();
  }

  ngOnInit() {}

  private valueSelected(v: IItem) {
    this.value = v.key;
  }

  private inputblur(e: Event) {
    const eInp = this.inputElement.nativeElement as HTMLInputElement;

    if (this.forceSelection) {
      this.value = this._items.length ? this._items[0].key : '';
    } else {
      this.value = eInp.value;
    }
  }

  private filter(keyword) {
    const newItem = { value: keyword, isNew: true, key: keyword };

    return new Observable((obs) => {
      if (!this.forceSelection) {
        obs.next([newItem]);
      }

      const p = this._source(keyword);
      if (!(p instanceof Promise)) {
        console.error('Expected source function to be async (must return a promise)');
        obs.error(new Error('Expected source function to be async (must return a promise)'));
        obs.complete();
        return;
      }

      p.then((vals: any[]) => {
        const items = vals.map((v, iX) => {
          return this.getItem(false, v);
        });

        if (!this.forceSelection && keyword.length && (!items.length || items[0].value !== keyword)) {
          items.unshift(newItem);
        }

        this._items = items;
        obs.next(items);
        obs.complete();
      }).catch((err) => {

        console.error(err);
        obs.error(err);
        obs.complete();
      });
    });

  }

  private updateGetItem() {
    this.getItem = new Function('isNew', 'v', `return {
      isNew: isNew,
      value: v${this._displayItem ? '.' + this._displayItem : ''},
      key: v${this._keyItem ? '.' + this._keyItem : ''} 
    }`) as (v: any, isNew: boolean) => { key: any, value: any, isNew: boolean };
  }

  writeValue(obj: any): void {
    this.value = obj;
  }
  registerOnChange(fn: any): void {
    this.onChange = fn;
  }
  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }
  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }
}
