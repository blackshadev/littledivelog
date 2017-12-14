import { Observable } from 'rxjs/Rx';
import { Router } from '@angular/router';
import { DiveStore, TFilterKeys } from '../../../services/dive.service';
import { Dive, IDbDive } from '../../../shared/dive';
import { Component, Input, OnInit, Output, EventEmitter, ElementRef, ViewChild } from '@angular/core';
import { Location } from '@angular/common';


@Component({
  selector: 'app-dive-list',
  templateUrl: './dive-list.component.html',
  styleUrls: ['./dive-list.component.scss']
})
export class DiveListComponent  {
  title = 'Dive list';

  @ViewChild('search') input: ElementRef;
  @Input() selectedDive: Dive;
  @Output() onDiveSelected: EventEmitter<Dive> = new EventEmitter<Dive>();
  dives: Dive[];

  constructor(
    public diveStore: DiveStore,
    protected location: Location,
  ) {
    this.refresh();
  }

  refresh() {
    const searchValue = this.input ? this.input.nativeElement.value : '';
    const o = this.extractSearches(searchValue);

    this.diveStore.getDives(o).then(
      (d) => {
        this.dives = d;
      }
    );
  }

  selectDive(d: Dive) {
    this.selectedDive = d;
    this.location.go(`/dive/${d.id}`);
    this.onDiveSelected.emit(d);
  }

  protected extractSearches(s: string): { [k in TFilterKeys]?: string } {
    const re = /([^:;]+):([^;$]+)/g;
    let m: RegExpExecArray;

    const o: { [k in TFilterKeys]?: string } = {};
    while ( (m = re.exec(s)) !== null ) {
      const tag = m[1];
      const value = m[2];
      o[tag] = value;
    }

    return o;
  }

}
