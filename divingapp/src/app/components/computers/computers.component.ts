import { Component, OnInit } from '@angular/core';
import { DiveStore, IComputer } from 'app/services/dive.service';

@Component({
  selector: 'app-computers',
  templateUrl: './computers.component.html',
  styleUrls: ['./computers.component.css']
})
export class ComputersComponent implements OnInit {

  computers: IComputer[] = [];

  constructor(private diveService: DiveStore) {
    diveService.getComputers().then((c) => {
      this.computers = c;
    });
   }

  ngOnInit() {
  }

}
