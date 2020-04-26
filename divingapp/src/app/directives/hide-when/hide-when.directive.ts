import { Directive, ElementRef, HostListener, Input } from '@angular/core';

type TSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

@Directive({
    selector: '[appHideWhenMobile]',
})
export class HideWhenMobileDirective {
    private _condition: boolean;
    private _size: TSize = 'md';

    @Input('appHideWhenMobile') set condition(v: boolean) {
        this._condition = v;
        this.apply();
    }

    @Input('isMobileWhen') set screenSize(s: TSize) {
        this._size = s;
        this.apply();
    }

    get isActive(): boolean {
        return this._condition && this.checkSize();
    }

    constructor(private el: ElementRef) {}

    @HostListener('window:resize', ['$event'])
    public onResize(event) {
        this.apply();
    }

    private checkSize(): boolean {
        const w = window.innerWidth;
        switch (this._size) {
            case 'xs':
                return w < 576;
            case 'sm':
                return w < 768;
            case 'md':
                return w < 992;
            case 'lg':
                return w < 1200;
            case 'xl':
                return true;
        }
    }

    private apply() {
        (<HTMLElement>this.el.nativeElement).style.display = this.isActive
            ? 'none'
            : '';
    }
}

@Directive({
    selector: '[appHideWhenDesktop]',
})
export class HideWhenDesktopDirective {
    private _condition: boolean;
    private _size: TSize = 'sm';

    @Input('appHideWhenDesktop') set condition(v: boolean) {
        this._condition = v;
        this.apply();
    }

    @Input('isMobileWhen') set screenSize(s: TSize) {
        this._size = s;
        this.apply();
    }

    get isActive(): boolean {
        return this._condition && this.checkSize();
    }

    constructor(private el: ElementRef) {}

    @HostListener('window:resize', ['$event'])
    onResize(event) {
        this.apply();
    }

    private checkSize(): boolean {
        const w = window.innerWidth;
        switch (this._size) {
            case 'xs':
                return w >= 768;
            case 'sm':
                return w >= 992;
            case 'md':
                return w >= 1200;
            case 'lg':
                return true;
        }
    }

    private apply() {
        (<HTMLElement>this.el.nativeElement).style.display = this.isActive
            ? 'none'
            : '';
    }
}
