import {
    Component,
    OnInit,
    Input,
    HostBinding,
    forwardRef,
    EventEmitter,
    Output,
    HostListener,
    ElementRef,
    ViewChild,
} from '@angular/core';
import { NG_VALUE_ACCESSOR, ControlValueAccessor } from '@angular/forms';
import { Observable } from 'rxjs';

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
            multi: true,
        },
    ],
})
export class AutocompleteComponent implements OnInit, ControlValueAccessor {
    @Output() changed = new EventEmitter<any>();
    @Output() keydown = new EventEmitter<Event>();

    @Input() inputClass: string;
    @Input() set source(v: SourceFunction) {
        if (!(v instanceof Function)) {
            throw new Error('Expected source to be a async function');
        }
        this._source = v;
    }

    @Input() set listItem(v: string) {
        this._listItem = v;
        this.updateGetItem();
    }

    @Input() set displayItem(v: string) {
        this._displayItem = v;
        this.updateGetItem();
    }

    @Input() set keyItem(v: any) {
        this._keyItem = v;
        this.updateGetItem();
    }

    @Input() set value(v: any) {
        if (this._value === v) {
            return;
        }
        this._selectedValue = undefined;
        this._value = v;
        this.onChange(v);
        this.onTouched();
        this.changed.emit(v);
    }

    get value(): any {
        return this._selectedValue ? this._selectedValue.key : this._value;
    }

    get viewValue(): any {
        const val = this._selectedValue
            ? this._selectedValue.value
            : this._value;
        if (val && typeof val === 'object' && this._displayItem) {
            return val[this._displayItem];
        } else {
            return val;
        }
    }

    @Input() newItem: (keyword: string) => any;
    @Input() disabled = false;
    @Input() placeholder = '';
    @Input() set forceSelection(v: any) {
        if (typeof v === 'string') {
            v = v === 'true' || v === '1';
        }
        this._forceSelection = v;
    }
    get forceSelection(): any {
        return this._forceSelection;
    }

    private _forceSelection: boolean;
    private _source: SourceFunction;
    private _value: any = '';
    private _displayItem: string;
    private _listItem: string;
    private _keyItem: string;
    private _selectedValue: IItem;
    private _items: IItem[] = [];
    @ViewChild('input', { static: true }) private inputElement: ElementRef;

    private ignoreAfterTab = false;
    private getItem: (isNew: boolean, v: any) => IItem;
    private onChange: (v: string) => void;
    private onTouched: () => void;

    constructor() {
        this.updateGetItem();
        this.onChange = () => {};
        this.onTouched = () => {};
    }

    ngOnInit() {}

    public valueSelected(v: IItem, e?) {
        if (typeof v !== "object") {
            return;
        }
        
        if (!this.ignoreAfterTab) {
            this._items = [v];
            this._selectedValue = v;
            this.value = v.key;
        } else {
            this._selectedValue = undefined;
        }
        this.ignoreAfterTab = false;
    }

    public inputblur(e: Event) {
        if (this.forceSelection) {
            const inp = this.inputElement.nativeElement as HTMLInputElement;
            inp.value = this.viewValue;
        }
    }

    public onKeyEnter(evt: Event) {
        if (this.forceSelection) {
            this.value = this._items[0].key;
        }
    }

    public onKeyTab(evt: Event) {
        this.ignoreAfterTab = true;
    }

    public clear(): void {
        this._selectedValue = undefined;
        this._value = '';
        this.inputElement.nativeElement.value = '';
    }

    public filter(keyword: string) {
        let newItem: IItem | undefined;
        if (this.newItem && keyword.length) {
            newItem = this.getItem(true, this.newItem(keyword));
        }

        return new Observable(obs => {
            if (newItem) {
                obs.next([newItem]);
            }

            const p = this._source(keyword);
            if (!(p instanceof Promise)) {
                console.error(
                    'Expected source function to be async (must return a promise)',
                );
                obs.error(
                    new Error(
                        'Expected source function to be async (must return a promise)',
                    ),
                );
                obs.complete();
                return;
            }

            p.then((vals: any[]) => {
                const items = vals.map((v, iX) => {
                    return this.getItem(false, v);
                });

                if (
                    newItem !== undefined &&
                    (!items.length ||
                        newItem.value.toLowerCase() !==
                            items[0].value.toLowerCase())
                ) {
                    items.unshift(newItem);
                }

                this._items = items;
                obs.next(items);
                obs.complete();
            }).catch(err => {
                console.error(err);
                obs.error(err);
                obs.complete();
            });
        });
    }

    public writeValue(obj: any): void {
        this._value = obj;
        this._selectedValue = undefined;
    }
    public registerOnChange(fn: any): void {
        this.onChange = fn;
    }
    public registerOnTouched(fn: any): void {
        this.onTouched = fn;
    }
    public setDisabledState(isDisabled: boolean): void {
        this.disabled = isDisabled;
    }

    public listFormatter(data) {
        return data[this._displayItem];
    }

    private updateGetItem() {
        const listItem = this._listItem || this._displayItem || this._keyItem;

        const displayGetter = `v${
            this._displayItem ? '.' + this._displayItem : ''
        }`;
        const listGetter = `v${listItem ? '.' + listItem : ''}`;
        this.getItem = new Function(
            'isNew',
            'v',
            `return {
                isNew: isNew,
                listValue: (isNew ? "(new) " : "") + ${listGetter},
                value: ${displayGetter},
                key: v${this._keyItem ? '.' + this._keyItem : ''}
            }`,
        ) as (
            v: any,
            isNew: boolean,
        ) => { key: any; listValue: any; value: any; isNew: boolean };
    }
}
