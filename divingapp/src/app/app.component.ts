import { Component, ViewChild, ElementRef } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  @ViewChild("appContainer") container: ElementRef; 
  toggleMenuCollapsed(isCollapsed: boolean) {
    console.log("collapsed", isCollapsed);
    let hElm = <HTMLElement>this.container.nativeElement;
    if(isCollapsed) {
      hElm.classList.add("menu-collapsed");
    } else {
      hElm.classList.remove("menu-collapsed");
    }
  }
}
