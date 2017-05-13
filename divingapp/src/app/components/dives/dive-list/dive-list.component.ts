import { Observable } from 'rxjs/Rx';
import { Router } from '@angular/router';
import { DiveStore } from '../../../services/dive.service';
import { Dive, IDbDive } from '../../../shared/dive';
import { Component, Input, OnInit, Output, EventEmitter } from '@angular/core';
import { Location } from '@angular/common';


@Component({
  selector: 'app-dive-list',
  templateUrl: './dive-list.component.html',
  styleUrls: ['./dive-list.component.scss']
})
export class DiveListComponent  {
  title = 'Dive list';

  @Input() selectedDive: Dive;
  dives: Dive[];

  constructor(
    public diveStore: DiveStore
  ) {
    this.refreshDives();
  }

  refreshDives() {
    this.diveStore.getDives().then(
      (d) => {
        this.dives = d;
      }
    );
  }

}
