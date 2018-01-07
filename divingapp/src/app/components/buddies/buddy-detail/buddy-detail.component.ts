import {
    Component, OnInit, Input, SimpleChanges, OnChanges, ElementRef,
    EventEmitter, Output, ViewChild
} from '@angular/core';
import { FormBuilder, Validators, FormGroup } from '@angular/forms';
import { CustomValidators } from 'app/shared/validators';
import { IBuddyStat, BuddyService } from 'app/services/buddy.service';
import { Router } from '@angular/router';
import { IDataChanged } from 'app/shared/datachanged.interface';
import { markFormGroupTouched } from 'app/shared/common';
import { DetailComponentComponent } from 'app/components/controls/detail-component/detail-component.component';

@Component({
    selector: 'app-buddy-detail',
    templateUrl: './buddy-detail.component.html',
    styleUrls: ['./buddy-detail.component.css']
})
export class BuddyDetailComponent implements OnInit {

    @Output() public onDataChanged: EventEmitter<IDataChanged> = new EventEmitter<IDataChanged>();

    @Input()
    public buddy: IBuddyStat;

    public get isNew() { return this.buddy.buddy_id === undefined; }
    public form: FormGroup

    @ViewChild('detailComponent') private detailComponent: DetailComponentComponent;

    constructor(
        private service: BuddyService,
        private _fb: FormBuilder,
        private router: Router,
    ) {

        this.form = this._fb.group({
            text: ['', [Validators.required]],
            color: ['', [Validators.required, CustomValidators.color]],
            email: ['', [CustomValidators.optionalEmail]]
        });

    }

    ngOnInit() {
    }

    public async onSubmit(e: Event) {
        e.preventDefault();
        markFormGroupTouched(this.form);
        if (!this.form.valid) {
            return;
        }

        const dat = this.form.value;

        const bud = await this.service.update({
            buddy_id: this.buddy ? this.buddy.buddy_id : undefined,
            color: dat.color,
            email: dat.email,
            text: dat.text,
        });

        this.onDataChanged.emit({
            type: this.isNew ? 'insert' : 'update',
            key: bud.buddy_id,
        });
        this.buddy.buddy_id = bud.buddy_id;

        this.applyData();
        this.detailComponent.reset();
    }

    protected applyData() {
        const d = this.form.value;
        this.buddy.email = d.email;
        this.buddy.text = d.text;
        this.buddy.color = d.color;
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

    public back() {
        this.router.navigateByUrl('/buddy');
    }

    async delete() {
        if (!this.buddy.buddy_id) {
            this.buddy = undefined;
            this.back();
        } else {
            await this.service.delete(this.buddy.buddy_id);
            this.onDataChanged.emit({
                type: 'delete',
                key: this.buddy.buddy_id,
            });
            this.buddy = undefined;
            this.back();
        }
    }

}
