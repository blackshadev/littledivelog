import {
    Component,
    OnInit,
    Input,
    SimpleChanges,
    OnChanges,
    ElementRef,
    Output,
    EventEmitter,
    ViewChild,
} from '@angular/core';
import { FormBuilder, Validators, FormGroup } from '@angular/forms';
import { CustomValidators } from 'app/shared/validators';
import { TagService, ITagStat } from 'app/services/tag.service';
import { Router } from '@angular/router';
import { IDataChanged } from 'app/shared/datachanged.interface';
import { markFormGroupTouched } from 'app/shared/common';
import { DetailComponentComponent } from 'app/components/controls/detail-component/detail-component.component';

@Component({
    selector: 'app-tag-detail',
    templateUrl: './tag-detail.component.html',
    styleUrls: ['./tag-detail.component.scss'],
})
export class TagDetailComponent implements OnInit {
    @Output() onDataChanged: EventEmitter<IDataChanged> = new EventEmitter<
        IDataChanged
    >();

    @Input()
    public tag: ITagStat;

    public get isNew() {
        return this.tag.tag_id === undefined;
    }

    public form: FormGroup;
    @ViewChild('detailComponent', { static: true })
    private detailComponent: DetailComponentComponent;

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

    ngOnInit() {}

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
        this.detailComponent.reset();
    }

    protected applyData() {
        const d = this.form.value;
        this.tag.text = d.text;
        this.tag.color = d.color;
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
