import { EventEmitter } from '@angular/forms/src/facade/async';
import { DiveService } from '../../services/dive.service';
import { Dive } from '../../shared/dive';
import { Component, OnInit, Output } from '@angular/core';

@Component({
  selector: 'dive-list',
  templateUrl: './dive-list.component.html',
  styleUrls: ['./dive-list.component.css']
})
export class DiveListComponent implements OnInit {
  title = 'Dive list';

  dives: Dive[];
  private selectedDive : Dive;
  @Output() onDiveSelected = new EventEmitter<Dive>();

  constructor(private diveService: DiveService) {}

  getDives() {
    this.diveService.getDives().then((d) => { this.dives = d; });
  }

  select(dive: Dive) {
    this.selectedDive = dive;
    this.onDiveSelected.emit(dive);
  }

  ngOnInit(): void {
    this.getDives();
  }
}
