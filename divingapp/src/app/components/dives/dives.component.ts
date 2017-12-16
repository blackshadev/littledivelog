import { DiveListComponent } from './dive-list/dive-list.component';
import { Subscription } from 'rxjs/Rx';
import { Dive } from '../../shared/dive';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { DiveService } from '../../services/dive.service';
import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
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
  private subs: Subscription[] = [];
  @ViewChild('diveList') private diveList: DiveListComponent;
  @ViewChild('diveDetail') private diveDetail: DiveDetailComponent;

  constructor(
    private service: DiveService,
    private route: ActivatedRoute,
    private router: Router,
    private location: Location,
  ) {}

  ngAfterViewInit() {
    // replace default back behaviour to prevent a reload
    this.diveDetail.back = () => {
      this.dive = undefined;
      this.location.go('/dive');
    };
  }

  ngOnInit(): void {
    if (this.route.snapshot.data && this.route.snapshot.data.isNew) {
      this.dive = Dive.New();
    } else {
      this.subs.push(
        this.route.params.flatMap(
          (params: Params) => {
            return params['id'] === undefined ?
              Promise.resolve(undefined) :
              this.service.getDive(+params['id']);
          }).subscribe(
            dive => this.dive = dive
          )
      );
    }
  }

  ngOnDestroy(): void {
    this.subs.forEach((s) => s.unsubscribe());
  }

  diveChanged(d: Dive) {
    this.diveList.refresh();
    this.dive = d;
  }

  async selectDive(id?: number) {
    if (id === undefined) {
      this.dive = undefined;
    } else {
      const dive = await this.service.getDive(id);
      this.dive = dive;
    }
    this.diveDetail.reset();
  }

}
