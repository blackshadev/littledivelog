import { Component, OnInit, Input, SimpleChanges, OnChanges, ElementRef } from '@angular/core';
import { FormBuilder, Validators, FormGroup } from '@angular/forms';
import { CustomValidators } from 'app/shared/validators';
import { IBuddyStat, BuddyService } from 'app/services/buddy.service';

@Component({
  selector: 'app-buddy-detail',
  templateUrl: './buddy-detail.component.html',
  styleUrls: ['./buddy-detail.component.css']
})
export class BuddyDetailComponent implements OnInit, OnChanges {

  @Input()
  public buddy: IBuddyStat;

  public form: FormGroup

  constructor(
    private service: BuddyService,
    private _fb: FormBuilder,
    private hostElement: ElementRef,
  ) {

    this.form = this._fb.group({
      text: ['', [Validators.required]],
      color: ['', [Validators.required, CustomValidators.color]],
      email: ['', [CustomValidators.optionalEmail]]
    });

  }

  ngOnInit() {
  }

  ngOnChanges(changes: SimpleChanges): void {
    this.reset();
  }

  public reset() {
    this.form.reset();
    if (this.buddy) {
      this.form.setValue({
        text: this.buddy.text,
        color: this.buddy.color,
        email: this.buddy.email,
      });
    }
  }

  public async onSubmit(e: Event) {
    e.preventDefault();
    const dat = this.form.value;

    await this.service.updateBuddy({
      buddy_id: this.buddy ? this.buddy.buddy_id : undefined,
      color: dat.color,
      email: dat.email,
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
