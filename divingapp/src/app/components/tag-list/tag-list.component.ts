import { Component, OnInit, Input, OnDestroy } from '@angular/core';
import {Location} from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';
import { TagService, ITagStat } from 'app/services/tag.service';

@Component({
  selector: 'app-tag-list',
  templateUrl: './tag-list.component.html',
  styleUrls: ['./tag-list.component.scss']
})
export class TagListComponent implements OnInit, OnDestroy {

  @Input()
  public selected?: ITagStat;
  public tags: ITagStat[] = [];

  private _id?: number;
  private sub: Subscription

  constructor(
    private tagService: TagService,
    private location: Location,
    private route: ActivatedRoute,
  ) {
    tagService.summarize().then((c) => {
      this.tags = c;
      if (this._id !== undefined) {
        this.selectById(this._id);
      }
    });
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

  ngOnDestroy() {
    this.sub.unsubscribe();
  }

  protected selectById(id: number) {
    this._id = id;
    if (this.tags) {
      this.selected = this.tags.find((b) => this._id === b.tag_id);
    }
  }

}
