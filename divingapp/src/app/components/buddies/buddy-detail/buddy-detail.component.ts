import { Component, OnInit, Input, SimpleChanges, OnChanges } from '@angular/core';
import { IBuddyStat, DiveStore } from 'app/services/dive.service';
import { FormBuilder, Validators, FormGroup } from '@angular/forms';
import { CustomValidators } from 'app/shared/validators';

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
    private service: DiveStore,
    private _fb: FormBuilder
  ) {

    this.form = this._fb.group({
      text: ['', [Validators.required]],
      color: ['', [Validators.required, CustomValidators.color]],
      email: ['', [Validators.email]]
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


}
