import { Directive, ElementRef, HostListener, Input } from '@angular/core';

type TSize = "xs"|"sm"|"md"|"lg";

function checkSize(s: TSize) {
  let w = window.innerWidth;
  switch(s) {
    case "xs": return w < 768;
    case "sm": return w < 992;
    case "md": return w < 1200;
    case "lg": return true;
  }
}

@Directive({
  selector: '[hide-when-mobile]'
})
export class HideWhenMobileDirective {

  @Input("hide-when-mobile") set condition(v: boolean) {
     this._condition = v;
     this.apply();
  }
  private _condition: boolean;

  @Input("is-mobile-when") set screenSize(s: TSize) {
    this._size = s;
    this.apply();
  }
  private _size: TSize = "sm";

  get isActive() : boolean {
    return this._condition && checkSize(this._size);
  }
  
  constructor(private el: ElementRef) {}

  private apply() {
    (<HTMLElement>this.el.nativeElement).style.display = this.isActive ? "none" : "";
  }

  @HostListener('window:resize', ['$event'])
  onResize(event) {
    this.apply();
  }

}
