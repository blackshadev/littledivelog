import { Subscription } from 'rxjs/Rx';
import { Dive } from '../../shared/dive';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { DiveService, TFilterKeys } from '../../services/dive.service';
import { Component, OnDestroy, OnInit, ViewChild, ElementRef } from '@angular/core';
import { DiveDetailComponent } from 'app/components/dives/dive-detail/dive-detail.component';
import { AfterViewInit } from '@angular/core/src/metadata/lifecycle_hooks';
import { Location } from '@angular/common';

@Component({
  selector: 'app-dives',
  templateUrl: './dives.component.html',
  styleUrls: ['./dives.component.scss']
})
export class DivesComponent implements OnInit, OnDestroy, AfterViewInit {

  public dive: Dive;
  public dives: Dive[];

  private subs: Subscription[] = [];

  @ViewChild('search') private input: ElementRef;
  @ViewChild('diveDetail') private diveDetail: DiveDetailComponent;

  constructor(
    private service: DiveService,
    private route: ActivatedRoute,
    private location: Location,
  ) {
    this.refresh();
  }

  ngAfterViewInit() {
    // replace default back behaviour to prevent a reload
    this.diveDetail.back = () => {
      this.dive = undefined;
      this.location.go('/dive');
    };
  }

  ngOnInit(): void {
    this.subs.push(
      this.route.params.flatMap(
        (params: Params) => {
          if (params['id'] === 'new') {
            return Promise.resolve(Dive.New());
          }
          if (params['id'] === undefined) {
            return Promise.resolve(undefined);
          } else {
            return this.service.getDive(+params['id']);
          }
        }).subscribe(
          dive => this.dive = dive
        )
    );

  }

  ngOnDestroy(): void {
    this.subs.forEach((s) => s.unsubscribe());
  }

  diveChanged(d: Dive) {
    this.refresh();
    this.dive = d;
  }

  async selectDive(d?: Dive) {
    if (d === undefined) {
      this.dive = undefined;
      this.location.go('/dive');
    } else {
      this.dive = await this.service.getDive(d.id);
      this.location.go('/dive/' + d.id);
    }
    this.diveDetail.reset();
  }

  refresh() {
    const searchValue = this.input ? this.input.nativeElement.value : '';
    const o = this.extractSearches(searchValue);

    this.service.getDives(o).then(
      (d) => {
        this.dives = d;
      }
    );
  }

  newDive() {
    this.location.go('/dive/new');
    this.dive = Dive.New();
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
