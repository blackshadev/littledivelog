import { Component, OnInit, Input, OnDestroy, ViewChild, AfterViewInit } from '@angular/core';
import {Location} from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { IBuddyStat, BuddyService } from 'app/services/buddy.service';
import { Subscription } from 'rxjs';
import { BuddyDetailComponent } from 'app/components/buddies/buddy-detail/buddy-detail.component';

@Component({
  selector: 'app-buddies',
  templateUrl: './buddies.component.html',
  styleUrls: ['./buddies.component.scss']
})
export class BuddiesComponent implements OnInit, OnDestroy, AfterViewInit {
  @Input()
  public selected?: IBuddyStat;
  public buddies: IBuddyStat[] = [];

  @ViewChild('detail') private detail: BuddyDetailComponent;
  private _id?: number;
  private sub: Subscription

  constructor(
    private buddyService: BuddyService,
    private location: Location,
    private route: ActivatedRoute,
  ) {
    this.refresh();
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

  ngAfterViewInit(): void {
    this.detail.back = () => {
      this.selected = undefined;
      this.location.go('/buddy');
    }
  }

  ngOnDestroy() {
    this.sub.unsubscribe();
  }

  public async refresh() {
    const c = await this.buddyService.summarize()
    this.buddies = c;
    if (this._id !== undefined) {
      this.selectById(this._id);
    }
  }

  public buddyDeleted() {
    this._id = undefined;
    this.selected = undefined;
    this.refresh();
  }

  protected selectById(id: number) {
    this._id = id;
    if (this.buddies) {
      this.selected = this.buddies.find((b) => this._id === b.buddy_id);
    }
  }

}
