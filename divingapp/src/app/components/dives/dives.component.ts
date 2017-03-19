import { Subscription } from 'rxjs/Rx';
import { Dive } from '../../shared/dive';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { DiveService } from '../../services/dive.service';
import { Component, OnDestroy, OnInit } from '@angular/core';

@Component({
  selector: 'dives',
  templateUrl: './dives.component.html',
  styleUrls: ['./dives.component.css']
})
export class DivesComponent implements OnInit, OnDestroy {

  private dive: Dive;
  private subs: Subscription[] = [];
    
  constructor(
    private service: DiveService, 
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.subs.push(
      this.route.params
        .switchMap((params: Params) => 
          params["id"] === undefined ? Promise.resolve(undefined) : this.service.getDive(+params["id"])
        ).subscribe(dive => this.dive = dive
        )
    );
  }

  ngOnDestroy(): void {
    this.subs.forEach((s) => s.unsubscribe());
  }

}
