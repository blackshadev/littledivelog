import { DiveListComponent } from './dive-list/dive-list.component';
import { Subscription } from 'rxjs/Rx';
import { Dive } from '../../shared/dive';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { DiveStore } from '../../services/dive.service';
import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';

@Component({
  selector: 'app-dives',
  templateUrl: './dives.component.html',
  styleUrls: ['./dives.component.scss']
})
export class DivesComponent implements OnInit, OnDestroy {

  public dive: Dive;
  private subs: Subscription[] = [];
  @ViewChild('diveList') private diveList: DiveListComponent;


  constructor(
    private service: DiveStore,
    private route: ActivatedRoute,
    private router: Router
  ) {}

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

  diveSaved(d: Dive) {
    this.diveList.refreshDives();
    this.router.navigate(['/dive', d.id]);
  }

}
