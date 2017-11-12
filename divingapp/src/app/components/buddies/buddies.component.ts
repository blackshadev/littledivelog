import { Component, OnInit } from '@angular/core';
import { DiveStore, IBuddyStat } from 'app/services/dive.service';

@Component({
  selector: 'app-computers',
  templateUrl: './buddies.component.html',
  styleUrls: ['./buddies.component.scss']
})
export class BuddiesComponent implements OnInit {

  public buddies: IBuddyStat[] = [];

  constructor(private diveService: DiveStore) {
    diveService.getBuddyStats().then((c) => {
      this.buddies = c;
    });
   }

  ngOnInit() {
  }

}
