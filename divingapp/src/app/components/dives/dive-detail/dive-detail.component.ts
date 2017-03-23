
import { Validators, FormBuilder, FormGroup, NgForm, FormControl } from '@angular/forms';
import { Observable } from 'rxjs/Rx';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { DiveStore } from '../../../services/dive.service';
import { Dive, Duration } from '../../../shared/dive';
import { SimpleChanges, OnInit, Component, Input, OnChanges } from '@angular/core';
import * as moment from "moment";

import 'rxjs/add/operator/switchMap';
import { CustomValidators } from "app/shared/validators";

@Component({
  selector: 'dive-detail',
  templateUrl: './dive-detail.component.html',
  styleUrls: ['./dive-detail.component.scss']
})
export class DiveDetailComponent implements OnInit, OnChanges {
  
  @Input() dive: Dive;

  public form: FormGroup;

  constructor(
    private service: DiveStore,
    private _fb: FormBuilder
  ) {
     this.form = this._fb.group({
        date: ['', [Validators.required, CustomValidators.datetime]],
        divetime: ['', [Validators.required, CustomValidators.duration]],
        maxDepth: ['', [Validators.required, Validators.pattern(/\d+(\.\d+)?/)]],
        place: this._fb.group({
            name: [''],
            country: ['']
        }, {
          validator: (g: FormGroup) => {
            let name = g.controls.name.value || "";
            let country = g.controls.country.value || "";
            
            
            let isValid =  name.length === 0 && country.length === 0 
                || name.length !== 0 && country.length !== 0 ;

            return isValid ? null : { 'both-required': true };
          }
        })
     });
  }

  ngOnInit(): void {
    
    
  }

  ngOnChanges(changes: SimpleChanges): void {
    if(!this.dive) this.form.reset();
    else this.form.setValue({
      date: moment(this.dive.date).format("DD-MM-YYYY HH:mm:ss"),
      divetime: this.dive.divetime.toString(),
      maxDepth: this.dive.maxDepth.toFixed(1),
      place: {
        name: this.dive.place.name,
        country: this.dive.place.country
      }
    });
  }

  get diagnostic() { 
    return JSON.stringify(this.form.value);
    // return JSON.stringify({
    //   date: this.dive.date,
    //   divetime: this.dive.divetime,
    //   maxDepth: this.dive.maxDepth,
    //   place: this.dive.placeStr
    // }); 
  }

  onSubmit() {
    let dat = this.form.value;
    let d = new Dive;
    d.id = this.dive.id;
    
    d.date = moment(dat.date, CustomValidators.DateTimeFormats, true).toDate();
    
    d.divetime = Duration.Parse(dat.divetime)
    d.maxDepth = Number(dat.maxDepth),
    d.place = {
      name: dat.place.name || undefined,
      country: dat.place.country || undefined
    };
    d.samples = this.dive.samples
    
    //this.dive = d;
    this.service.saveDive(d);
  }

}
