import { AutocompleteComponent } from '../autocomplete/autocomplete.component';
import { ITag } from '../tags/tags.component';
import { leftpad } from '../../../shared/formatters';
import {
    Component,
    ElementRef,
    EventEmitter,
    forwardRef,
    Input,
    OnInit,
    Output,
    ViewChild,
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

@Component({
    selector: 'app-tags-control',
    templateUrl: './tags-control.component.html',
    styleUrls: ['./tags-control.component.scss'],
    providers: [
        {
            provide: NG_VALUE_ACCESSOR,
            useExisting: forwardRef(() => TagsControlComponent),
            multi: true,
        },
    ],
})
export class TagsControlComponent implements OnInit, ControlValueAccessor {
    @Input() source: (keyword: string) => Promise<ITag[]>;
    @Input() tags: ITag[];
    @Input() placeholder = '';
    @Input() keyField;

    @Output() change = new EventEmitter<ITag[]>();
    @Output() touched = new EventEmitter<ITag[]>();

    @ViewChild('tagInput', { static: true }) private tagInput: ElementRef;

    @ViewChild('tagAutocomplete', { static: true })
    private tagAutocomplete: AutocompleteComponent;

    private onChange: (v: ITag[]) => void;
    private onTouched: () => void;

    public static randomColor() {
        const r = leftpad(2, Math.floor(Math.random() * 255).toString(16));
        const g = leftpad(2, Math.floor(Math.random() * 255).toString(16));
        const b = leftpad(2, Math.floor(Math.random() * 255).toString(16));
        return `#${r}${g}${b}`;
    }

    constructor() {
        this.tags = [];
        this.onChange = () => {};
        this.onTouched = () => {};
    }

    ngOnInit() {}

    public newTag(value: string): ITag {
        return { color: TagsControlComponent.randomColor(), text: value };
    }

    public async getData(keyword: string): Promise<any[]> {
        const map = {};
        for (const tag of this.tags) {
            map[tag[this.keyField]] = true;
        }

        let res = await this.source(keyword);
        res = res.filter(v => {
            return !v[this.keyField] || !map[v[this.keyField]];
        });

        return res;
    }

    public addTag(v: ITag) {
        this.tags.push(v);

        this.doChange();
        this.doTouched();
        this.clearInput();
    }

    public removeTag(iX: number) {
        this.tags.splice(iX, 1);
        this.doChange();
        this.doTouched();
    }

    public writeValue(obj: any): void {
        this.tags = obj;
    }

    public registerOnChange(fn: any): void {
        this.onChange = fn;
    }

    public registerOnTouched(fn: any): void {
        this.onTouched = fn;
    }

    public setDisabledState(isDisabled: boolean): void {
        throw new Error('Method not implemented.');
    }

    public clearInput() {
        if (this.tagInput) {
            const el = this.tagInput.nativeElement as HTMLInputElement;
            el.value = '';
        } else if (this.tagAutocomplete) {
            this.tagAutocomplete.clear();
        }
    }

    private fontColor(color: string) {
        if (color[0] === '#') {
            color = color.substr(1);
        }

        const r = parseInt(color.substr(0, 2), 16);
        const g = parseInt(color.substr(2, 2), 16);
        const b = parseInt(color.substr(4, 2), 16);
        const yiq = (r * 299 + g * 587 + b * 114) / 1000;
        return yiq >= 128 ? 'black' : 'white';
    }

    private doChange() {
        this.onChange(this.tags);
        this.change.emit(this.tags);
    }

    private doTouched() {
        this.onTouched();
        this.touched.emit();
    }
}
