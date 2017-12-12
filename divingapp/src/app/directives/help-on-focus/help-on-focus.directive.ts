import { Directive, ElementRef, HostListener, Input } from '@angular/core';

@Directive({
  selector: '[appHelpOnFocus]'
})
export class HelpOnFocusDirective {

  // tslint:disable-next-line:no-input-rename
  @Input('aria-describedby') public helpElementId;

  get helpElement(): HTMLElement {
    return document.getElementById(this.helpElementId);
  }

  constructor(
    private element: ElementRef,
  ) {  }

  @HostListener('focus', ['$event'])
  private onFocus(e) {
    this.helpElement.style.display = '';
  }

  @HostListener('blur', ['$event'])
  private onBlur(e) {
    this.helpElement.style.display = 'none';
  }

}
