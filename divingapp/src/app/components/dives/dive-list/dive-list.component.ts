import { Router } from '@angular/router';
import { DiveStore } from '../../../services/dive.service';
import { Dive } from '../../../shared/dive';
import { Component, Input, OnInit, Output, EventEmitter } from '@angular/core';
import { Location } from '@angular/common';


@Component({
  selector: 'app-dive-list',
  templateUrl: './dive-list.component.html',
  styleUrls: ['./dive-list.component.css']
})
export class DiveListComponent implements OnInit {
  title = 'Dive list';

  @Input() selectedDive: Dive;
  @Output() onDiveSelected = new EventEmitter<Dive>();

  constructor(
    private location: Location,
    private router: Router,
    private diveStore: DiveStore
  ) {}

  select(dive: Dive) {
    this.location.go(`/dive/${dive.id}`);
    this.selectedDive = dive;
    this.onDiveSelected.emit(dive);
  }

  ngOnInit(): void {
  }
}
