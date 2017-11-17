import { Component, OnInit, Input, OnDestroy } from '@angular/core';
import { DiveStore, IBuddyStat } from 'app/services/dive.service';
import {Location} from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-computers',
  templateUrl: './buddies.component.html',
  styleUrls: ['./buddies.component.scss']
})
export class BuddiesComponent implements OnInit, OnDestroy {

  @Input()
  public selected?: IBuddyStat;
  public buddies: IBuddyStat[] = [];

  private _id?: number;
  private sub: Subscription

  constructor(
    private diveService: DiveStore,
    private location: Location,
    private route: ActivatedRoute,
  ) {
    diveService.getBuddyStats().then((c) => {
      this.buddies = c;
      if (this._id !== undefined) {
        this.selectById(this._id);
      }
    });
  }

  public rowClick(bud: IBuddyStat) {
    this.selected = bud;
    this.location.go(`/buddy/${bud.buddy_id}`)
  }

  ngOnInit() {
    this.sub = this.route.params.subscribe(params => {
      this.selectById(+params['id']);
    });
  }

  ngOnDestroy() {
    this.sub.unsubscribe();
  }

  protected selectById(id: number) {
    this._id = id;
    if (this.buddies) {
      this.selected = this.buddies.find((b) => this._id === b.buddy_id);
    }
  }

}
