import {
    Component, OnInit, Input, EventEmitter, Output, TemplateRef,
    ElementRef, ViewChild, OnChanges, SimpleChanges
} from '@angular/core';
import { FormGroup } from '@angular/forms';

@Component({
    selector: 'app-detail-component',
    templateUrl: './detail-component.component.html',
    styleUrls: ['./detail-component.component.scss']
})
export class DetailComponentComponent implements OnInit {

    @Input() data: any;

    @Input() form: FormGroup;
    @Output() onSubmit: EventEmitter<any> = new EventEmitter();
    @Output() onBack: EventEmitter<any> = new EventEmitter();
    // @Output() onReset: EventEmitter<any> = new EventEmitter();
    // @Output() onReset: EventEmitter<any> = new EventEmitter();

    get pageKeys() { return Object.keys(this.pages); }
    @Input() pages: { [name: string]: TemplateRef<any> } = {};
    @Input() defaultPage;
    @Input() showDebug = true;


    @ViewChild('content') private content;

    constructor(
        private hostElement: ElementRef,
    ) {}

    ngOnInit() {
        this.reset();
    }

    reset() {
        this.form.reset(this.data);
    }

    onEnter(e: KeyboardEvent) {

        // prevent submit
        e.preventDefault();

        // tab on enter
        const contentEl = this.content.nativeElement as HTMLElement;
        const currentTab = contentEl.querySelector('.tab-pane.active');
        if (currentTab && e.target instanceof HTMLInputElement) {
            e.target.blur();
            const all = currentTab.querySelectorAll('input.form-control') as NodeListOf<HTMLInputElement> ;
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

}
