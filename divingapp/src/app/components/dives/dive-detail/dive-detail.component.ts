import {NgForm} from '@angular/forms';
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

  constructor(
    private service: DiveStore
  ) {}

  ngOnInit(): void {}

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

  updateDate(txt: string) {
    this.dive.date = new Date(txt);
  }

  updateDiveTime(txt: string) {
    this.dive.divetime = Duration.Parse(txt);
  }
}
