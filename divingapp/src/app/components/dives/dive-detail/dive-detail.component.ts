
import { Validators, FormBuilder, FormGroup, NgForm, FormControl } from '@angular/forms';
import { Observable } from 'rxjs/Rx';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { DiveStore } from '../../../services/dive.service';
import { Dive, Duration } from '../../../shared/dive';
import { SimpleChanges, OnInit, Component, Input, OnChanges } from '@angular/core';
import * as moment from 'moment';

import 'rxjs/add/operator/switchMap';
import { CustomValidators } from 'app/shared/validators';


declare function $(...args: any[]): any;

@Component({
  selector: 'app-dive-detail',
  templateUrl: './dive-detail.component.html',
  styleUrls: ['./dive-detail.component.scss']
})
export class DiveDetailComponent implements OnInit, OnChanges {

  @Input() dive: Dive;

  public form: FormGroup;
  CurrentDate: string = moment().format('DD-MM-YYYY HH:mm:ss');

  testSource: string[] = ['One', 'Two', 'Three'];

  constructor(
    private service: DiveStore,
    private _fb: FormBuilder
  ) {
     this.form = this._fb.group({
        date: ['', [Validators.required, CustomValidators.datetime]],
        divetime: ['', [Validators.required, CustomValidators.duration]],
        maxDepth: ['', [Validators.required, CustomValidators.decimal]],
        place: this._fb.group({
            name: [''],
            country: ['']
        }, {
          validator: (g: FormGroup) => {
            const name = g.controls.name.value || '';
            const country = g.controls.country.value || '';

            const isValid =  name.length === 0 && country.length === 0
                || name.length !== 0 && country.length !== 0 ;

            return isValid ? null : { 'both-required': true };
          }
        }),
        tank: this._fb.group({
          volume: ['', [Validators.required, CustomValidators.integer]],
          pressureStart: ['', [Validators.required, CustomValidators.decimal]],
          pressureEnd: ['', [Validators.required, CustomValidators.decimal]],
          pressureType: ['', [Validators.required, Validators.pattern(/bar|psi/)]],
          airPercentage: ['', [Validators.required, CustomValidators.integer]]
        }),
        buddy: [''],
        tag: [''],
        test: ['']
     });
  }

  ngOnInit(): void {
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (!this.dive) {
      this.form.reset();
    } else {
      this.form.setValue({
        date: moment(this.dive.date).format('DD-MM-YYYY HH:mm:ss'),
        divetime: this.dive.divetime.toString(),
        maxDepth: this.dive.maxDepth.toFixed(1),
        place: {
          name: this.dive.place.name,
          country: this.dive.place.country
        },
        tank: {
          volume: this.dive.tanks.length ? this.dive.tanks[0].volume : '',
          airPercentage: this.dive.tanks.length ? this.dive.tanks[0].oxygen : '',
          pressureStart: this.dive.tanks.length ? this.dive.tanks[0].pressure.start : '',
          pressureEnd: this.dive.tanks.length ? this.dive.tanks[0].pressure.end : '',
          pressureType: this.dive.tanks.length ? this.dive.tanks[0].pressure.type : 'bar',
        },
        buddy: '',
        tag: '',
        test: ''
      });
    }
  }

  get diagnostic() {
    return this.form.value;
  }

  onSubmit() {
    const dat = this.form.value;
    const d = new Dive;
    d.id = this.dive.id;

    d.date = moment(dat.date, CustomValidators.DateTimeFormats, true).toDate();

    d.divetime = Duration.Parse(dat.divetime);
    d.maxDepth = Number(dat.maxDepth);
    d.place = {
      name: dat.place.name || undefined,
      country: dat.place.country || undefined
    };

    d.tanks = [{
      oxygen: dat.tank.airPercentage,
      volume: dat.tank.volume,
      pressure: {
        start: dat.tank.pressureStart,
        end: dat.tank.pressureEnd,
        type: dat.tank.pressureType,
      }
    }];

    d.samples = this.dive.samples;
    // this.dive = d;
    this.service.saveDive(d);
  }

}
