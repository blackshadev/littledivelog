import { Router } from '@angular/router';
import { EventEmitter } from '@angular/forms/src/facade/async';
import { DiveService } from '../../../services/dive.service';
import { Dive } from '../../../shared/dive';
import { Component, Input, OnInit, Output } from '@angular/core';
import { Location } from '@angular/common';


@Component({
  selector: 'dive-list',
  templateUrl: './dive-list.component.html',
  styleUrls: ['./dive-list.component.css']
})
export class DiveListComponent implements OnInit {
  title = 'Dive list';

  dives: Dive[];
  @Input() selectedDive : Dive;
  @Output() onDiveSelected = new EventEmitter<Dive>();

  constructor(
    private location: Location,
    private router: Router,
    private diveService: DiveService
  ) {}

  getDives() {
    this.diveService.getDives().then((d) => { this.dives = d; });
  }

  select(dive: Dive) {
    this.location.go(`/dive/${dive.id}`);
    this.selectedDive = dive;
    this.onDiveSelected.emit(dive);
  }

  ngOnInit(): void {
    this.getDives();
  }
}
