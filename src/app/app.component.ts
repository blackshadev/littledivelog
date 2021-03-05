import { Component, ViewChild, ElementRef, OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit {
    @ViewChild('appContainer', { static: true }) container: ElementRef;
    isCollapsed = false;

    toggleMenuCollapsed(isCollapsed: boolean) {
        const hElm = <HTMLElement>this.container.nativeElement;
        if (isCollapsed) {
            hElm.classList.add('menu-collapsed');
        } else {
            hElm.classList.remove('menu-collapsed');
        }
    }

    ngOnInit(): void {
        this.isCollapsed = window.innerWidth < 992;
    }
}
