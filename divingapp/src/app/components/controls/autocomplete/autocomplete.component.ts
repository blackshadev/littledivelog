import { Component, OnInit, Input, HostBinding, forwardRef } from '@angular/core';
import { NG_VALUE_ACCESSOR, ControlValueAccessor } from '@angular/forms';
import { Observable } from "rxjs/Rx";

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
  @Input() inputClass: string;
  @Input() set source(v: Observable<any[]>) {
    if (!(v instanceof Observable)) {
      this._source = Observable.of(v);
    } else {
      this._source = v;
    }
  }

  get source() {
    return this._source !== undefined ? this._source : Observable.of([]);
  }

  private _source: Observable<any[]> = Observable.of([]);
  // tslint:disable-next-line:no-input-rename
  @Input('display-item') displayItem: any;
  // tslint:disable-next-line:no-input-rename
  @Input('select-value-of') selectValueOf: any;
  @Input() set value(v: string) {
    this._value = v;
    this.onChange(v);
    this.onTouched();
  }
  @Input() disabled = false;

  private _value: string;
  private onChange: any = () => { };
  private onTouched: any = () => { };

  constructor() { }

  ngOnInit() {}

  private valueSelected(v: string) {
    console.log(v);
  }

  private changeValue(v) {
    this._value = v;

  }

  private getDisplayItem(v: any) {
    return this.displayItem ? v[this.displayItem] : v.toString();
  }

  private filter(keyword) {
    const re = new RegExp(keyword, 'i');
    console.log(this.source);
    return this.source.map((items) => {
      const arr = items.map((v) => {
        return {
          value: this.getDisplayItem(v)
        };
      }).filter((k) => {
        return re.test(k.value);
      });
      console.log(arr);
      return arr;
    });
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
