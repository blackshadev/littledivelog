import { Component, OnInit } from '@angular/core';
import { DiveService, IComputer } from 'app/services/dive.service';

@Component({
    selector: 'app-computers',
    templateUrl: './computers.component.html',
    styleUrls: ['./computers.component.scss']
})
export class ComputersComponent implements OnInit {

    public computers: IComputer[] = [];

    public constructor(diveService: DiveService) {
        diveService.listComputers().then((c) => {
            this.computers = c;
        });
    }

    ngOnInit() { }

}
