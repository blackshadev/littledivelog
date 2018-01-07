import { Component, OnInit, Input, SimpleChanges, OnChanges, ElementRef, Output, EventEmitter } from '@angular/core';
import { FormBuilder, Validators, FormGroup } from '@angular/forms';
import { CustomValidators } from 'app/shared/validators';
import { TagService, ITagStat } from 'app/services/tag.service';
import { Router } from '@angular/router';
import { IDataChanged } from 'app/shared/datachanged.interface';
import { markFormGroupTouched } from 'app/shared/common';

@Component({
    selector: 'app-tag-detail',
    templateUrl: './tag-detail.component.html',
    styleUrls: ['./tag-detail.component.scss']
})
export class TagDetailComponent implements OnInit, OnChanges {

    @Output() onDataChanged: EventEmitter<IDataChanged> = new EventEmitter<IDataChanged>();

    @Input()
    public tag: ITagStat;

    public get isNew() {
        return this.tag.tag_id === undefined;
    }

    public form: FormGroup

    constructor(
        private service: TagService,
        private _fb: FormBuilder,
        private hostElement: ElementRef,
        private router: Router,
    ) {
        this.form = this._fb.group({
            text: ['', [Validators.required]],
            color: ['', [Validators.required, CustomValidators.color]],
        });

    }

    ngOnInit() {
    }

    ngOnChanges(changes: SimpleChanges): void {
        this.reset();
    }

    public reset() {
        this.form.reset();
        if (this.tag) {
            this.form.setValue({
                text: this.tag.text,
                color: this.tag.color,
            });
        }
    }

    public async onSubmit(e: Event) {
        e.preventDefault();
        markFormGroupTouched(this.form);
        if (!this.form.valid) {
            return;
        }

        const dat = this.form.value;

        const tag = await this.service.update({
            tag_id: this.tag ? this.tag.tag_id : undefined,
            color: dat.color,
            text: dat.text,
        });
        this.onDataChanged.emit({
            type: this.tag.tag_id === undefined ? 'insert' : 'update',
            key: tag.tag_id,
        });
        this.tag.tag_id = tag.tag_id;

        this.applyData();
        this.reset();
    }

    public onEnter(e: Event) {
        // prevent submit
        e.preventDefault();

        // tab on enter
        const hostEl = this.hostElement.nativeElement as HTMLElement;
        if (e.target instanceof HTMLInputElement) {
            e.target.blur();
            const all = hostEl.querySelectorAll('input');
            let iX: number;
            for (iX = 0; iX < all.length; iX++) {
                if (all.item(iX) === e.target) {
                    break;
                }
            }
            if (iX + 1 < all.length) {
                all.item(iX + 1).select();
            }
        }

    }

    public controlChanged(ctrl: string) {
        this.form.controls[ctrl].markAsDirty();
        this.form.controls[ctrl].setValue(this.form.controls[ctrl].value);
    }

    protected applyData() {
        const d = this.form.value;
        this.tag.text = d.text;
        this.tag.color = d.color;
    }

    get diagnostic() {
        function getDirtyValues(cg: FormGroup) {
            const dirtyValues = {};  // initialize empty object
            Object.keys(cg.controls).forEach((c) => {

                const currentControl = cg.controls[c];

                if (currentControl.dirty) {
                    if ((<FormGroup>currentControl).controls) { // check for nested controlGroups
                        dirtyValues[c] = getDirtyValues(<FormGroup>currentControl);  // recursion for nested controlGroups
                    } else {
                        dirtyValues[c] = true;  // simple control
                    }
                }

            });
            return dirtyValues;
        }
        function getInvalidValues(cg: FormGroup) {
            const invalidValues = {};  // initialize empty object
            Object.keys(cg.controls).forEach((c) => {

                const currentControl = cg.controls[c];

                if (!currentControl.valid) {
                    if ((<FormGroup>currentControl).controls) { // check for nested controlGroups
                        invalidValues[c] = getInvalidValues(<FormGroup>currentControl);  // recursion for nested controlGroups
                    } else {
                        invalidValues[c] = true;  // simple control
                    }
                }

            });
            return invalidValues;
        }

        return {
            value: this.form.value,
            formDirty: this.form.dirty,
            dirty: getDirtyValues(this.form),
            invalid: getInvalidValues(this.form),
        };
    }

    back() {
        this.router.navigate(['/tag']);
    }

    async delete() {

        if (!this.tag.tag_id) {
            this.tag = undefined;
            this.back();
        } else {
            await this.service.delete(this.tag.tag_id);
            this.onDataChanged.emit({
                type: 'delete',
                key: this.tag.tag_id,
            });
            this.back();
        }
    }


}
