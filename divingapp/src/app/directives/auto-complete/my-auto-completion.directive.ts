import { Directive, Input, EventEmitter, Output, HostBinding, HostListener, ElementRef } from '@angular/core';
import { Ng2AutoCompleteModule } from 'ng2-auto-complete';

@Directive({
    selector: '[appAutoCompletion]'
})
export class MyAutoCompletionDirective {
    @Output() valueChanged: EventEmitter<string> = new EventEmitter<string>();
    private element: ElementRef;

    constructor(el: ElementRef) {
        this.element = el;
    }

    @HostListener('valueChanged', ['$event'])
    private onvalueChanged(e) {
        this.valueChanged.emit(e);
    }
}
