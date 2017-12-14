import { Directive, ElementRef, HostListener, Input } from '@angular/core';

type TSize = 'xs'|'sm'|'md'|'lg'|'xl';


@Directive({
  selector: '[appHideWhenMobile]'
})
export class HideWhenMobileDirective {

  @Input('appHideWhenMobile') set condition(v: boolean) {
     this._condition = v;
     this.apply();
  }
  private _condition: boolean;

  @Input('isMobileWhen') set screenSize(s: TSize) {
    this._size = s;
    this.apply();
  }
  private _size: TSize = 'lg';

  get isActive(): boolean {
    return this._condition && this.checkSize();
  }

  constructor(private el: ElementRef) {}

  @HostListener('window:resize', ['$event'])
  public onResize(event) {
    this.apply();
  }

  private  checkSize(): boolean {
    const w = window.innerWidth;
    switch (this._size) {
      case 'xs': return w < 576;
      case 'sm': return w < 768;
      case 'md': return w < 922;
      case 'lg': return w < 1200;
      case 'xl': return true;
    }
  }

  private apply() {
    (<HTMLElement>this.el.nativeElement).style.display = this.isActive ? 'none' : '';
  }


}

@Directive({
  selector: '[appHideWhenDesktop]'
})
export class HideWhenDesktopDirective {

  @Input('appHideWhenDesktop') set condition(v: boolean) {
     this._condition = v;
     this.apply();
  }
  private _condition: boolean;

  @Input('isMobileWhen') set screenSize(s: TSize) {
    this._size = s;
    this.apply();
  }
  private _size: TSize = 'sm';

  get isActive(): boolean {
    return this._condition && this.checkSize();
  }

  private  checkSize(): boolean {
    const w = window.innerWidth;
    switch (this._size) {
      case 'xs': return w >= 768;
      case 'sm': return w >= 992;
      case 'md': return w >= 1200;
      case 'lg': return true;
    }
  }

  constructor(private el: ElementRef) {}

  private apply() {
    (<HTMLElement>this.el.nativeElement).style.display = this.isActive ? 'none' : '';
  }

  @HostListener('window:resize', ['$event'])
  onResize(event) {
    this.apply();
  }

}
