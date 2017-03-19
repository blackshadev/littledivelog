import { Observable } from 'rxjs/Rx';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { DiveService } from '../../../services/dive.service';
import { Dive } from '../../../shared/dive';
import {OnInit, Component,  Input} from '@angular/core';

import 'rxjs/add/operator/switchMap';

@Component({
  selector: 'dive-detail',
  templateUrl: './dive-detail.component.html',
  styleUrls: ['./dive-detail.component.css']
})
export class DiveDetailComponent implements OnInit {
  @Input() dive: Dive;


  ngOnInit(): void {}
}
