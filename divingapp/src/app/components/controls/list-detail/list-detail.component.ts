import { Component, OnInit, TemplateRef, Input } from '@angular/core';

@Component({
    selector: 'app-list-detail',
    templateUrl: './list-detail.component.html',
    styleUrls: ['./list-detail.component.scss']
})
export class ListDetailComponent implements OnInit {

    @Input() listTemplate: TemplateRef<any>;
    @Input() detailTemplate: TemplateRef<any>;
    @Input() menuTemplate: TemplateRef<any>;
    @Input() selected: any;

    constructor() { }

    ngOnInit() {
    }

}
