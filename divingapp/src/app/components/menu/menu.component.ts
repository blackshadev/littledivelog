import { ViewChild, Component, OnInit, ElementRef, Output, EventEmitter, Input } from '@angular/core';


@Component({
  selector: 'app-menu',
  templateUrl: './menu.component.html',
  styleUrls: ['./menu.component.scss']
})
export class MenuComponent implements OnInit {
  
  @ViewChild('menuContainer') menuContainer: ElementRef;
  @Output() ontoggle = new EventEmitter<boolean>();
  @Input() set state(v: boolean) {
    this.toggle(v);
  }

  constructor() {}

  ngOnInit() {}

  toggle(state?: boolean) {
    let hElm = (<HTMLElement>this.menuContainer.nativeElement);
    let isCollapsed = hElm.classList.contains("collapsed");
    state = state === undefined ? !isCollapsed : state;
    if(state) {
      hElm.classList.add("collapsed");
    } else {
      hElm.classList.remove("collapsed");
    }
    this.ontoggle.emit(state);
  }

}
