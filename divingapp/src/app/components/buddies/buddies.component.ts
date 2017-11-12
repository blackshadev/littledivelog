import { Component, OnInit } from '@angular/core';
import { DiveStore, IComputer } from 'app/services/dive.service';

@Component({
  selector: 'app-computers',
  templateUrl: './buddies.component.html',
  styleUrls: ['./buddies.component.scss']
})
export class BuddiesComponent implements OnInit {

  computers: IComputer[] = [];

  constructor(private diveService: DiveStore) {
    diveService.getComputers().then((c) => {
      this.computers = c;
    });
   }

  ngOnInit() {
  }

}
