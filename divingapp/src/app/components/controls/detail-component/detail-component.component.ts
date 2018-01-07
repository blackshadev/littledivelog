import { Component, OnInit, Input, EventEmitter, Output } from '@angular/core';
import { FormGroup } from '@angular/forms';

@Component({
    selector: 'app-detail-component',
    templateUrl: './detail-component.component.html',
    styleUrls: ['./detail-component.component.scss']
})
export class DetailComponentComponent implements OnInit {
    @Input() form: FormGroup;
    @Output() onSubmit: EventEmitter<any> = new EventEmitter();

    constructor() { }

    ngOnInit() {
    }

}
