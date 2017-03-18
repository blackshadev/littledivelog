import { DiveService } from '../../services/dive.service';
import { Dive } from '../../shared/dive';
import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'dive-detail',
  templateUrl: './dive-detail.component.html',
  styleUrls: ['./dive-detail.component.css']
})
export class DiveDetailComponent {
  @Input() dive: Dive;
}
