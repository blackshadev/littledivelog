import {ViewChild, Component,  OnInit,  ElementRef} from '@angular/core';

@Component({
  selector: 'app-menu',
  templateUrl: './menu.component.html',
  styleUrls: ['./menu.component.scss']
})
export class MenuComponent implements OnInit {
  
  @ViewChild('menuContainer') menuContainer: ElementRef; 

  constructor() {}

  ngOnInit() {
  }

  toggle() {
    let hElm = (<HTMLElement>this.menuContainer.nativeElement);
    if(hElm.classList.contains("collapsed")) {
      hElm.classList.remove("collapsed");
    } else {
      hElm.classList.add("collapsed");
    }
    console.log("Toggle", hElm.className);
;  }

}
