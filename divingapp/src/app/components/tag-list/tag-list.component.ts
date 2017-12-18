import { Component, OnInit, Input, OnDestroy, AfterViewInit, ViewChild } from '@angular/core';
import {Location} from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';
import { TagService, ITagStat } from 'app/services/tag.service';
import { TagDetailComponent } from 'app/components/tag-list/tag-detail/tag-detail.component';

@Component({
  selector: 'app-tag-list',
  templateUrl: './tag-list.component.html',
  styleUrls: ['./tag-list.component.scss']
})
export class TagListComponent implements OnInit, OnDestroy, AfterViewInit {

  @ViewChild('detail') public detail: TagDetailComponent;

  @Input()
  public selected?: ITagStat;
  public tags: ITagStat[] = [];

  private _id?: number;
  private sub: Subscription

  constructor(
    private service: TagService,
    private location: Location,
    private route: ActivatedRoute,
  ) {
    this.refresh();
  }

  public rowClick(bud: ITagStat) {
    this.selected = bud;
    this.location.go(`/tag/${bud.tag_id}`)
  }

  ngOnInit() {
    this.sub = this.route.params.subscribe(params => {
      this.selectById(+params['id']);
    });
  }

  ngAfterViewInit() {
    this.detail.back = () => {
      this.selected = undefined;
      this.location.go('/tag');
    }
  }

  ngOnDestroy() {
    this.sub.unsubscribe();
  }

  public buddyDeleted() {
    this._id = undefined;
    this.selected = undefined;
    this.refresh();
  }

  public async refresh() {
    const c = await this.service.summarize();
    this.tags = c;
    if (this._id !== undefined) {
      this.selectById(this._id);
    }
  }

  protected selectById(id: number) {
    this._id = id;
    if (this.tags) {
      this.selected = this.tags.find((b) => this._id === b.tag_id);
    }
  }

}
