import { Component, OnInit, Input, SimpleChanges, OnChanges, ElementRef } from '@angular/core';
import { FormBuilder, Validators, FormGroup } from '@angular/forms';
import { CustomValidators } from 'app/shared/validators';
import { TagService, ITagStat } from 'app/services/tag.service';

@Component({
  selector: 'app-tag-detail',
  templateUrl: './tag-detail.component.html',
  styleUrls: ['./tag-detail.component.css']
})
export class TagDetailComponent implements OnInit, OnChanges {

  @Input()
  public tag: ITagStat;

  public form: FormGroup

  constructor(
    private service: TagService,
    private _fb: FormBuilder,
    private hostElement: ElementRef,
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
    const dat = this.form.value;

    await this.service.update({
      tag_id: this.tag ? this.tag.tag_id : undefined,
      color: dat.color,
      text: dat.text,
    });

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
          if ((<FormGroup> currentControl).controls) { // check for nested controlGroups
            dirtyValues[c] = getDirtyValues(<FormGroup> currentControl);  // recursion for nested controlGroups
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
          if ((<FormGroup> currentControl).controls) { // check for nested controlGroups
            invalidValues[c] = getInvalidValues(<FormGroup> currentControl);  // recursion for nested controlGroups
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
