import { Component, ViewChild, ElementRef, HostListener, OnInit } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {

  @ViewChild("appContainer") container: ElementRef;
  isCollapsed: boolean = false;

  toggleMenuCollapsed(isCollapsed: boolean) {
    let hElm = <HTMLElement>this.container.nativeElement;
    if(isCollapsed) {
      hElm.classList.add("menu-collapsed");
    } else {
      hElm.classList.remove("menu-collapsed");
    }
  }
  
  ngOnInit(): void {
    this.isCollapsed = window.innerWidth < 992;
  }
  
}
