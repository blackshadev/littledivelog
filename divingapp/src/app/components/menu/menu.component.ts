import {ViewChild, Component,  OnInit,  ElementRef, Output} from '@angular/core';
import { EventEmitter } from '@angular/forms/src/facade/async';

@Component({
  selector: 'app-menu',
  templateUrl: './menu.component.html',
  styleUrls: ['./menu.component.scss']
})
export class MenuComponent implements OnInit {
  
  @ViewChild('menuContainer') menuContainer: ElementRef;
  @Output() ontoggle = new EventEmitter<boolean>();

  constructor() {}

  ngOnInit() {}

  toggle() {
    let hElm = (<HTMLElement>this.menuContainer.nativeElement);
    let isCollapsed = hElm.classList.contains("collapsed");
    if(isCollapsed) {
      hElm.classList.remove("collapsed");
    } else {
      hElm.classList.add("collapsed");
    }
    this.ontoggle.emit(!isCollapsed);
  }

}
