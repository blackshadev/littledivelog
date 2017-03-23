import {Validators, FormBuilder,  FormGroup,   NgForm} from '@angular/forms';
import { Observable } from 'rxjs/Rx';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { DiveStore } from '../../../services/dive.service';
import { Dive, Duration } from '../../../shared/dive';
import {OnInit, Component,  Input} from '@angular/core';

import 'rxjs/add/operator/switchMap';

@Component({
  selector: 'dive-detail',
  templateUrl: './dive-detail.component.html',
  styleUrls: ['./dive-detail.component.scss']
})
export class DiveDetailComponent implements OnInit {
  @Input() dive: Dive;

  public form: FormGroup;

  constructor(
    private service: DiveStore,
    private _fb: FormBuilder
  ) {}

  ngOnInit(): void {
     this.form = this._fb.group({
            date: ['', [Validators.required]],
            divetime: ['', [Validators.required]],
            maxDepth: ['', [Validators.required]],
            place: this._fb.group({
                name: ['', Validators.required],
                country: ['',Validators.required]
            }, {
              validator: (g: FormGroup) => {
                console.log(g.controls.name.value);
                return !(g.controls.name.value || "").length === !(g.controls.country.value || "").length
              }
            })
        });

  }

  get diagnostic() { 
    return JSON.stringify({
      date: this.dive.date,
      divetime: this.dive.divetime,
      maxDepth: this.dive.maxDepth,
      place: this.dive.placeName + " " + this.dive.placeCountry
    }); 
  }

  onSubmit(f: NgForm) {
    console.log(f.value);
    if(!f.valid) console.error("INVALID");
  }

}
